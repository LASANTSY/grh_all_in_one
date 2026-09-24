import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <h1 className="text-6xl font-bold text-slate-900">404</h1>
      <p className="text-slate-600">Page introuvable</p>
      <Link
        to="/"
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Retour a l accueil
      </Link>
    </div>
  );
}