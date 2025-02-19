import PassportVerificationForm from "@/components/forms/PassportVerificationForm";

export default async function PassportVerificationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Passport Verification
          </h1>
          <PassportVerificationForm />
        </div>
      </div>
    </main>
  );
}
