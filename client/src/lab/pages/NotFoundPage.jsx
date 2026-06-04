import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div className="container grid min-h-[60vh] place-items-center text-center">
    <div>
      <p className="text-5xl">🔍</p>
      <h1 className="mt-4 text-2xl font-semibold">Bunday yo'nalish topilmadi</h1>
      <p className="mt-2 text-muted-foreground">
        Bu kategoriya hali mavjud emas yoki manzil noto'g'ri.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
      >
        Bosh sahifaga qaytish
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
