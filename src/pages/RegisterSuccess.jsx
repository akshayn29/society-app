import { Link } from "react-router-dom";
import { CheckCircle, Shield } from "lucide-react";

export default function RegisterSuccess() {
  return (
    <div className="min-h-screen hero-pattern flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="card shadow-xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900 mb-3">
            Registration Submitted!
          </h1>
          <p className="text-slate-500 mb-6">
            Your registration has been submitted successfully. The society admin will verify
            your details and approve your account within 24 hours.
          </p>
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-sm text-primary-700 mb-6">
            📧 You will receive an email once your account is approved.
          </div>
          <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" /> Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
