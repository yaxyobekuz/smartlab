// Lists the topics of one subject (/:subject).
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getSubject } from "@/lab/data/subjects";
import NotFoundPage from "./NotFoundPage";

const SubjectPage = () => {
  const { subject: slug } = useParams();
  const subject = getSubject(slug);
  if (!subject) return <NotFoundPage />;

  return (
    <div className="container py-8">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} /> Bosh sahifa
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <span
          className="grid size-12 place-items-center rounded-xl text-2xl"
          style={{ backgroundColor: `${subject.color}1a` }}
        >
          {subject.icon}
        </span>
        <div>
          <h1 className="text-2xl font-semibold">{subject.title}</h1>
          <p className="text-sm text-muted-foreground">{subject.short}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subject.topics.map((t) => (
          <Link
            key={t.slug}
            to={`/${subject.slug}/${t.slug}`}
            className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div className="text-3xl">{t.icon}</div>
            <h3 className="mt-3 font-semibold">{t.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.short}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Ko'rish
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SubjectPage;
