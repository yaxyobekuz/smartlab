# Mesh building helpers. All inputs are three.js coordinates (meters, Y up).
import math

import bmesh
import bpy
from mathutils import Matrix, Vector

AXES = {"+x": Vector((1, 0, 0)), "-x": Vector((-1, 0, 0)), "+y": Vector((0, 1, 0)),
        "-y": Vector((0, -1, 0)), "+z": Vector((0, 0, 1)), "-z": Vector((0, 0, -1))}


def rot_matrix(rx=0.0, ry=0.0, rz=0.0):
    # Euler XYZ in degrees (three.js space), returned as 4x4.
    return (Matrix.Rotation(math.radians(rz), 4, "Z") @ Matrix.Rotation(math.radians(ry), 4, "Y")
            @ Matrix.Rotation(math.radians(rx), 4, "X"))


class Acc:
    # Accumulates faces for one output object (possibly several materials).

    def __init__(self, name):
        self.name = name
        self.verts = []
        self.faces = []      # tuples of vertex indices
        self.face_mat = []   # material name per face
        self.face_smooth = []
        self.loop_uv = []    # list per face: [(u, v), ...]
        self.loop_lm = []    # per face: preset lightmap UVs [(u, v), ...] or None (unwrapped at bake time)
        self.origin = (0.0, 0.0, 0.0)  # three.js coords; mesh verts are stored in world space

    def add_face_data(self, verts, faces, mats, smooth, uvs, lms=None):
        base = len(self.verts)
        self.verts.extend(verts)
        lms = lms or [None] * len(faces)
        for f, m, s, uv, lm in zip(faces, mats, smooth, uvs, lms):
            self.faces.append(tuple(i + base for i in f))
            self.face_mat.append(m)
            self.face_smooth.append(s)
            self.loop_uv.append(uv)
            self.loop_lm.append(lm)

    def tri_count(self):
        return sum(len(f) - 2 for f in self.faces)


DETAIL_DIAG = 0.35  # static parts smaller than this get lightmap UVs projected from nearby surfaces


class Scene:
    def __init__(self, materials):
        self.materials = materials   # name -> spec dict (needs 'repeat', optional 'uv_rot90')
        self.static = {}             # material -> Acc (lightmap receivers)
        self.detail = {}             # material -> Acc (small parts, proxy lightmap UVs)
        self.objects = {}            # special object name -> Acc
        self.force = None            # None | 'detail' | 'receiver'

    def S(self, mat):
        if mat not in self.static:
            self.static[mat] = Acc("static_" + mat)
        return self.static[mat]

    def D(self, mat):
        if mat not in self.detail:
            self.detail[mat] = Acc("detail_" + mat)
        return self.detail[mat]

    def O(self, name):
        if name not in self.objects:
            self.objects[name] = Acc(name)
        return self.objects[name]

    def target(self, obj, mat, verts=None):
        if obj:
            return self.O(obj)
        if self.force == "detail":
            return self.D(mat)
        if self.force == "receiver" or verts is None:
            return self.S(mat)
        xs, ys, zs = zip(*verts)
        diag = math.sqrt((max(xs) - min(xs)) ** 2 + (max(ys) - min(ys)) ** 2 + (max(zs) - min(zs)) ** 2)
        return self.D(mat) if diag < DETAIL_DIAG else self.S(mat)


class force_kind:
    # with force_kind(scene, 'detail'): ... routes static primitives explicitly.

    def __init__(self, scene, kind):
        self.scene, self.kind, self.prev = scene, kind, None

    def __enter__(self):
        self.prev = self.scene.force
        self.scene.force = self.kind

    def __exit__(self, *exc):
        self.scene.force = self.prev


def _preset_lm(bm):
    # Per-face preset lightmap UVs from bmesh layers 'lightmap' (loop uv) + 'lm_preset' (face int).
    lay = bm.loops.layers.uv.get("lightmap")
    flag = bm.faces.layers.int.get("lm_preset")
    if lay is None or flag is None:
        return None
    return {f.index: [tuple(l[lay].uv) for l in f.loops] for f in bm.faces if f[flag]}


def _uv_box(co, n, repeat, rot90):
    ax = max(range(3), key=lambda i: abs(n[i]))
    x, y, z = co
    if ax == 1:
        u, v = x, (-z if n[1] > 0 else z)
    elif ax == 0:
        u, v = (-z if n[0] > 0 else z), y
    else:
        u, v = (x if n[2] > 0 else -x), y
    if rot90:
        u, v = v, -u
    return (u / repeat, v / repeat)


def emit_bmesh(scene, bm, mat, obj=None, matrix=None, smooth=False, uv="box", uv_rect=None,
               smooth_angle=None):
    # Append a bmesh (local space) to the target accumulator.
    if matrix is not None:
        bm.transform(matrix)
    bm.normal_update()
    spec = scene.materials[mat]
    repeat = spec.get("repeat", 1.0)
    rot90 = spec.get("uv_rot90", False)
    uv_layer = bm.loops.layers.uv.get("UVMap") or bm.loops.layers.uv.active
    bm.verts.index_update()
    bm.faces.index_update()
    preset = _preset_lm(bm) or {}
    verts = [tuple(v.co) for v in bm.verts]
    faces, mats, smooths, uvs = [], [], [], []
    lms = []
    for f in bm.faces:
        lms.append(preset.get(f.index))
        faces.append(tuple(v.index for v in f.verts))
        mats.append(mat)
        if smooth_angle is not None:
            smooths.append(True)
        else:
            smooths.append(bool(smooth))
        if uv == "keep" and uv_layer is not None:
            lu = []
            for loop in f.loops:
                u, v = loop[uv_layer].uv
                if uv_rect:
                    u = uv_rect[0] + u * (uv_rect[2] - uv_rect[0])
                    v = uv_rect[1] + v * (uv_rect[3] - uv_rect[1])
                lu.append((u, v))
            uvs.append(lu)
        else:
            uvs.append([_uv_box(loop.vert.co, f.normal, repeat, rot90) for loop in f.loops])
    if verts:
        scene.target(obj, mat, verts).add_face_data(verts, faces, mats, smooths, uvs, lms)
    bm.free()


def _bevel(bm, width, edges=None, segments=1):
    if width <= 0:
        return
    edges = edges if edges is not None else list(bm.edges)
    if not edges:
        return
    bmesh.ops.bevel(bm, geom=edges, offset=width, offset_type="OFFSET", segments=segments, profile=0.5,
                    affect="EDGES", clamp_overlap=True)


def box(scene, mat, center, size, bevel=0.003, skip=(), obj=None, rot=None, pivot=None, segments=1,
        flip=False, nobevel=()):
    # Axis-aligned (optionally rotated) box. size = (sx, sy, sz) in three.js axes.
    sx, sy, sz = size
    bm = bmesh.new()
    hx, hy, hz = sx / 2, sy / 2, sz / 2
    coords = [(-hx, -hy, -hz), (hx, -hy, -hz), (hx, hy, -hz), (-hx, hy, -hz),
              (-hx, -hy, hz), (hx, -hy, hz), (hx, hy, hz), (-hx, hy, hz)]
    vs = [bm.verts.new(c) for c in coords]
    quads = {"-z": (0, 3, 2, 1), "+z": (4, 5, 6, 7), "-y": (0, 1, 5, 4), "+y": (3, 7, 6, 2),
             "-x": (0, 4, 7, 3), "+x": (1, 2, 6, 5)}
    tagged = {}
    for key, q in quads.items():
        f = bm.faces.new([vs[i] for i in q])
        tagged[f] = key
    bm.normal_update()
    skip = set(skip)
    b = min(bevel, 0.4 * min(sx, sy, sz)) if bevel else 0
    if b > 1e-5:
        keep_sharp = set(skip) | set(nobevel)
        edges = [e for e in bm.edges if not any(tagged[f] in keep_sharp for f in e.link_faces)]
        _bevel(bm, b, edges, segments)
    if skip:
        bm.normal_update()
        half = {"x": hx, "y": hy, "z": hz}
        dele = []
        for f in bm.faces:
            c = f.calc_center_median()
            for k in skip:
                a = AXES[k]
                i = "xyz".index(k[1])
                if f.normal.dot(a) > 0.999 and abs(c[i] * a[i] - half[k[1]]) < 1e-5:
                    dele.append(f)
                    break
        bmesh.ops.delete(bm, geom=dele, context="FACES")
    m = Matrix.Translation(Vector(center))
    if rot:
        if pivot is not None:
            p = Vector(pivot)
            m = Matrix.Translation(p) @ rot_matrix(*rot) @ Matrix.Translation(Vector(center) - p)
        else:
            m = m @ rot_matrix(*rot)
    if flip:
        bmesh.ops.reverse_faces(bm, faces=list(bm.faces))
    emit_bmesh(scene, bm, mat, obj=obj, matrix=m, smooth=(segments > 1))


def box_minmax(scene, mat, mn, mx, **kw):
    c = tuple((a + b) / 2 for a, b in zip(mn, mx))
    s = tuple(abs(b - a) for a, b in zip(mn, mx))
    box(scene, mat, c, s, **kw)


def quad(scene, mat, center, size, facing="+z", obj=None, uv_rect=(0, 0, 1, 1), uv="keep", rot=None):
    # Flat rectangle with UV 0..1 (u to the viewer's right, v up; Blender convention).
    w, h = size
    bm = bmesh.new()
    uvl = bm.loops.layers.uv.new("UVMap")
    vs = [bm.verts.new((-w / 2, -h / 2, 0)), bm.verts.new((w / 2, -h / 2, 0)),
          bm.verts.new((w / 2, h / 2, 0)), bm.verts.new((-w / 2, h / 2, 0))]
    f = bm.faces.new(vs)
    for loop, uvv in zip(f.loops, [(0, 0), (1, 0), (1, 1), (0, 1)]):
        loop[uvl].uv = uvv
    # local frame: right=+x, up=+y, normal=+z -> rotate to facing
    orient = {"+z": Matrix.Identity(4), "-z": rot_matrix(0, 180, 0), "+x": rot_matrix(0, 90, 0),
              "-x": rot_matrix(0, -90, 0), "-y": rot_matrix(90, 0, 0), "+y": rot_matrix(-90, 0, 0)}[facing]
    m = Matrix.Translation(Vector(center)) @ (rot_matrix(*rot) if rot else Matrix.Identity(4)) @ orient
    emit_bmesh(scene, bm, mat, obj=obj, matrix=m, uv=uv, uv_rect=uv_rect)


def cylinder(scene, mat, center, radius, height, axis="y", segments=24, caps=(True, True), obj=None,
             rot=None, smooth=True, radius_top=None, bevel=0.0):
    # Cylinder/cone centered at `center` along axis. caps=(bottom, top).
    rt = radius if radius_top is None else radius_top
    bm = bmesh.new()
    ring_b, ring_t = [], []
    for i in range(segments):
        a = 2 * math.pi * i / segments
        ring_b.append(bm.verts.new((radius * math.cos(a), -height / 2, -radius * math.sin(a))))
        ring_t.append(bm.verts.new((rt * math.cos(a), height / 2, -rt * math.sin(a))))
    sides = []
    for i in range(segments):
        j = (i + 1) % segments
        sides.append(bm.faces.new((ring_b[i], ring_b[j], ring_t[j], ring_t[i])))
    capf = []
    if caps[0] and radius > 0:
        capf.append(bm.faces.new(list(reversed(ring_b))))
    if caps[1] and rt > 0:
        capf.append(bm.faces.new(ring_t))
    bm.normal_update()
    if bevel > 0 and capf:
        edges = [e for e in bm.edges if any(f in capf for f in e.link_faces) and len(e.link_faces) == 2]
        _bevel(bm, bevel, edges)
    orient = {"y": Matrix.Identity(4), "x": rot_matrix(0, 0, -90), "z": rot_matrix(90, 0, 0)}[axis]
    m = Matrix.Translation(Vector(center)) @ (rot_matrix(*rot) if rot else Matrix.Identity(4)) @ orient
    bm.transform(m)
    bm.normal_update()
    _emit_mixed_smooth(scene, bm, mat, obj, smooth)


def _emit_mixed_smooth(scene, bm, mat, obj, smooth, angle=35.0):
    # Faces whose normals are within `angle` of a neighbour are smooth; flat caps stay flat.
    spec = scene.materials[mat]
    repeat = spec.get("repeat", 1.0)
    rot90 = spec.get("uv_rot90", False)
    bm.verts.index_update()
    bm.faces.index_update()
    preset = _preset_lm(bm) or {}
    verts = [tuple(v.co) for v in bm.verts]
    faces, mats, smooths, uvs, lms = [], [], [], [], []
    cos_lim = math.cos(math.radians(angle))
    for f in bm.faces:
        lms.append(preset.get(f.index))
        faces.append(tuple(v.index for v in f.verts))
        mats.append(mat)
        is_smooth = False
        if smooth:
            for e in f.edges:
                for g in e.link_faces:
                    if g is not f and f.normal.dot(g.normal) > cos_lim and f.normal.dot(g.normal) < 0.99999:
                        is_smooth = True
        smooths.append(is_smooth)
        uvs.append([_uv_box(loop.vert.co, f.normal, repeat, rot90) for loop in f.loops])
    if verts:
        scene.target(obj, mat, verts).add_face_data(verts, faces, mats, smooths, uvs, lms)
    bm.free()


def lathe(scene, mat, center, profile, segments=32, obj=None, rot=None, smooth=True, close_top=True,
          close_bottom=True, scale=(1, 1, 1)):
    # Revolve profile [(radius, y), ...] (bottom to top) around local Y.
    bm = bmesh.new()
    rings = []
    for r, y in profile:
        if r <= 1e-6:
            rings.append([bm.verts.new((0, y, 0))])
            continue
        ring = []
        for i in range(segments):
            a = 2 * math.pi * i / segments
            ring.append(bm.verts.new((r * math.cos(a) * scale[0], y * scale[1], -r * math.sin(a) * scale[2])))
        rings.append(ring)
    for k in range(len(rings) - 1):
        A, B = rings[k], rings[k + 1]
        for i in range(segments):
            j = (i + 1) % segments
            if len(A) == 1 and len(B) == 1:
                continue
            if len(A) == 1:
                bm.faces.new((A[0], B[j], B[i]))
            elif len(B) == 1:
                bm.faces.new((A[i], A[j], B[0]))
            else:
                bm.faces.new((A[i], A[j], B[j], B[i]))
    if close_bottom and len(rings[0]) > 1:
        bm.faces.new(list(reversed(rings[0])))
    if close_top and len(rings[-1]) > 1:
        bm.faces.new(rings[-1])
    m = Matrix.Translation(Vector(center)) @ (rot_matrix(*rot) if rot else Matrix.Identity(4))
    bm.transform(m)
    bm.normal_update()
    _emit_mixed_smooth(scene, bm, mat, obj, smooth, angle=40.0)


def tube(scene, mat, path, radius, segments=12, obj=None, caps=True, smooth=True, lm_preset=False):
    # Sweep a circle along a polyline path (list of 3D points), parallel-transport frames.
    pts = [Vector(p) for p in path]
    bm = bmesh.new()
    tangents = []
    for i in range(len(pts)):
        if i == 0:
            t = pts[1] - pts[0]
        elif i == len(pts) - 1:
            t = pts[-1] - pts[-2]
        else:
            t = (pts[i + 1] - pts[i]).normalized() + (pts[i] - pts[i - 1]).normalized()
        tangents.append(t.normalized())
    up = Vector((0, 1, 0)) if abs(tangents[0].dot(Vector((0, 1, 0)))) < 0.9 else Vector((1, 0, 0))
    nrm = tangents[0].cross(up).normalized()
    rings = []
    for i, p in enumerate(pts):
        if i > 0:
            axis = tangents[i - 1].cross(tangents[i])
            if axis.length > 1e-8:
                ang = tangents[i - 1].angle(tangents[i])
                nrm = (Matrix.Rotation(ang, 3, axis.normalized()) @ nrm).normalized()
        bin_ = tangents[i].cross(nrm).normalized()
        ring = []
        for k in range(segments):
            a = 2 * math.pi * k / segments
            ring.append(bm.verts.new(p + radius * (math.cos(a) * nrm + math.sin(a) * bin_)))
        rings.append(ring)
    lm = bm.loops.layers.uv.new("lightmap") if lm_preset else None
    flag = bm.faces.layers.int.new("lm_preset") if lm_preset else None
    along = [0.0]
    for i in range(1, len(pts)):
        along.append(along[-1] + (pts[i] - pts[i - 1]).length)
    circ = 2 * math.pi * radius
    for i in range(len(rings) - 1):
        for k in range(segments):
            j = (k + 1) % segments
            f = bm.faces.new((rings[i][k], rings[i][j], rings[i + 1][j], rings[i + 1][k]))
            if lm_preset:
                u0, u1 = circ * k / segments, circ * (k + 1) / segments
                for loop, uv in zip(f.loops, ((u0, along[i]), (u1, along[i]), (u1, along[i + 1]), (u0, along[i + 1]))):
                    loop[lm].uv = uv
                f[flag] = 1
    if caps:
        bm.faces.new(list(reversed(rings[0])))
        bm.faces.new(rings[-1])
    bm.normal_update()
    _emit_mixed_smooth(scene, bm, mat, obj, smooth, angle=50.0)


def arc_points(center, radius, a0, a1, n, plane="xy"):
    # Points on an arc in a plane through center; angles in degrees.
    out = []
    for i in range(n + 1):
        a = math.radians(a0 + (a1 - a0) * i / n)
        c, s = math.cos(a) * radius, math.sin(a) * radius
        if plane == "xy":
            out.append((center[0] + c, center[1] + s, center[2]))
        elif plane == "zy":
            out.append((center[0], center[1] + s, center[2] + c))
        else:  # xz
            out.append((center[0] + c, center[1], center[2] + s))
    return out


def polygon_face(scene, mat, pts, obj=None, uv="box"):
    # Single n-gon from 3D points (three.js coords), counter-clockwise seen from the front.
    bm = bmesh.new()
    vs = [bm.verts.new(p) for p in pts]
    bm.faces.new(vs)
    emit_bmesh(scene, bm, mat, obj=obj, uv=uv)


def plane_with_holes(scene, mat, axis, level, u_range, v_range, holes, obj=None, flip=False):
    # Axis-aligned rectangle split into quads around rectangular holes.
    us = sorted({u_range[0], u_range[1], *[h[0] for h in holes], *[h[1] for h in holes]})
    vs_ = sorted({v_range[0], v_range[1], *[h[2] for h in holes], *[h[3] for h in holes]})
    bm = bmesh.new()
    grid = {}

    def P(u, v):
        key = (round(u, 6), round(v, 6))
        if key not in grid:
            if axis == "x":
                co = (level, v, u)
            elif axis == "y":
                co = (u, level, v)
            else:
                co = (u, v, level)
            grid[key] = bm.verts.new(co)
        return grid[key]

    for i in range(len(us) - 1):
        for j in range(len(vs_) - 1):
            cu = (us[i] + us[i + 1]) / 2
            cv = (vs_[j] + vs_[j + 1]) / 2
            if any(h[0] <= cu <= h[1] and h[2] <= cv <= h[3] for h in holes):
                continue
            q = [P(us[i], vs_[j]), P(us[i + 1], vs_[j]), P(us[i + 1], vs_[j + 1]), P(us[i], vs_[j + 1])]
            if flip:
                q.reverse()
            bm.faces.new(q)
    # merge into larger faces is unnecessary; keep quads (lightmap islands merge by smart project)
    emit_bmesh(scene, bm, mat, obj=obj)


def to_blender(acc, materials_by_name, collection):
    # Create a Blender mesh object from an accumulator. Origin = acc.origin (three.js coords).
    ox, oy, oz = acc.origin
    mesh = bpy.data.meshes.new(acc.name)
    verts = [(x - ox, -(z - oz), y - oy) for (x, y, z) in acc.verts]
    mesh.from_pydata(verts, [], acc.faces)
    mat_names = []
    for m in acc.face_mat:
        if m not in mat_names:
            mat_names.append(m)
    for m in mat_names:
        mesh.materials.append(materials_by_name[m])
    idx = [mat_names.index(m) for m in acc.face_mat]
    mesh.polygons.foreach_set("material_index", idx)
    mesh.polygons.foreach_set("use_smooth", acc.face_smooth)
    uvl = mesh.uv_layers.new(name="UVMap")
    flat = []
    for luv in acc.loop_uv:
        for u, v in luv:
            flat.extend((u, v))
    uvl.data.foreach_set("uv", flat)
    if any(lm is not None for lm in acc.loop_lm):
        lml = mesh.uv_layers.new(name="lightmap")
        flat = []
        for luv, lm in zip(acc.loop_uv, acc.loop_lm):
            for k in range(len(luv)):
                flat.extend(lm[k] if lm is not None else (0.0, 0.0))
        lml.data.foreach_set("uv", flat)
        attr = mesh.attributes.new("lm_preset", "BOOLEAN", "FACE")
        attr.data.foreach_set("value", [lm is not None for lm in acc.loop_lm])
    mesh.validate(clean_customdata=False)
    mesh.update()
    obj = bpy.data.objects.new(acc.name, mesh)
    obj.location = (ox, -oz, oy)
    collection.objects.link(obj)
    return obj


def disc(scene, mat, center, radius, facing="+z", segments=48, obj=None, uv_rect=(0, 0, 1, 1)):
    # Flat disc; UV maps its bounding square to uv_rect (u right, v up).
    bm = bmesh.new()
    uvl = bm.loops.layers.uv.new("UVMap")
    vs = []
    for i in range(segments):
        a = 2 * math.pi * i / segments
        vs.append(bm.verts.new((radius * math.cos(a), radius * math.sin(a), 0)))
    f = bm.faces.new(vs)
    for loop in f.loops:
        x, y, _ = loop.vert.co
        loop[uvl].uv = (0.5 + x / (2 * radius), 0.5 + y / (2 * radius))
    orient = {"+z": Matrix.Identity(4), "-z": rot_matrix(0, 180, 0), "+x": rot_matrix(0, 90, 0),
              "-x": rot_matrix(0, -90, 0), "-y": rot_matrix(90, 0, 0), "+y": rot_matrix(-90, 0, 0)}[facing]
    m = Matrix.Translation(Vector(center)) @ orient
    emit_bmesh(scene, bm, mat, obj=obj, matrix=m, uv="keep", uv_rect=uv_rect)


def cyl_label(scene, mat, center, radius, y0, y1, a0, a1, uv_rect, segments=10, obj=None):
    # Partial cylinder band around local Y at `center` (x, z), angles in degrees (lathe convention:
    bm = bmesh.new()
    uvl = bm.loops.layers.uv.new("UVMap")
    cols = []
    for i in range(segments + 1):
        a = math.radians(a0 + (a1 - a0) * i / segments)
        x, z = radius * math.cos(a), -radius * math.sin(a)
        cols.append((bm.verts.new((x, y0, z)), bm.verts.new((x, y1, z)), i / segments))
    for i in range(segments):
        b0, t0, u0 = cols[i]
        b1, t1, u1 = cols[i + 1]
        f = bm.faces.new((b0, b1, t1, t0))
        for loop, uv in zip(f.loops, [(u0, 0), (u1, 0), (u1, 1), (u0, 1)]):
            loop[uvl].uv = uv
    bm.normal_update()
    # ensure outward normals
    for f in bm.faces:
        c = f.calc_center_median()
        if f.normal.dot(Vector((c.x, 0, c.z))) < 0:
            f.normal_flip()
    m = Matrix.Translation(Vector(center))
    emit_bmesh(scene, bm, mat, obj=obj, matrix=m, uv="keep", uv_rect=uv_rect, smooth=True)


def strip_profile(scene, mat, points_uw, axis_len, obj=None, frame=None):
    # Extrude a 2D polyline profile along a straight axis. points_uw: [(u, w), ...] in the profile plane;
    bm = bmesh.new()
    A = [bm.verts.new(frame(u, w, 0.0)) for u, w in points_uw]
    B = [bm.verts.new(frame(u, w, axis_len)) for u, w in points_uw]
    for i in range(len(points_uw) - 1):
        bm.faces.new((A[i], A[i + 1], B[i + 1], B[i]))
    emit_bmesh(scene, bm, mat, obj=obj)
