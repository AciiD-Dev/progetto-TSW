'use client';

export default function SupportPage() {
  function openSupportEmail() {
    window.open(
      "https://mail.google.com/mail/?view=cm&fs=1&to=homehub.assistenza@gmail.com&su=Supporto%20HomeHub&body=Ciao%2C%20ho%20bisogno%20di%20supporto%20per%20HomeHub.",
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#334155] px-6 py-10">
      <section className="max-w-3xl mx-auto">
        <div className="rounded-3xl bg-white border border-[#e6eaf2] p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#eef0ff] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#7c83ff] text-[32px]">
                help_outline
              </span>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-[#334155]">
                Hai bisogno di aiuto?
              </h1>
              <p className="text-[#64748b] mt-1">
                Siamo qui per aiutarti con HomeHub.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#f8fafc] border border-[#e6eaf2] p-5 mb-6">
            <h2 className="text-lg font-semibold mb-2 text-[#334155]">
              Contatta il supporto
            </h2>
            <p className="text-[#64748b]">
              Se hai problemi con dispositivi, stanze, impostazioni o automazioni,
              puoi inviare una richiesta di assistenza tramite email.
            </p>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={openSupportEmail}
              className="inline-flex items-center gap-2 rounded-xl bg-[#eef0ff] text-[#7c83ff] px-6 py-3 font-bold border border-[#d8dcff] hover:bg-[#7c83ff] hover:text-white transition"
            >
              <span className="material-symbols-outlined text-[20px]">
                mail
              </span>
              Contattaci
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}