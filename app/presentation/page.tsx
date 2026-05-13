export default function HomeHubPresentationPreview() {
  return (
    <main className="min-h-screen bg-[#F6F8FE] text-[#303746]">
      <section className="relative min-h-screen overflow-hidden px-6 py-8">
        <img
          src="/homehub-rooms.png"
          alt="Anteprima della sezione Rooms di HomeHub"
          className="absolute inset-0 h-full w-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-[#F6F8FE]/90" />

        <div className="relative z-10 mx-auto flex min-h-[90vh] max-w-7xl flex-col">
          <header className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7474E8] shadow-lg shadow-[#7474E8]/30">
                <span className="text-2xl font-black text-white">H</span>
              </div>
              <span className="text-2xl font-bold text-[#7474E8]">HomeHub</span>
            </div>

            <nav className="hidden items-center gap-8 text-sm font-semibold text-[#6F778A] md:flex">
              <a href="#controllo" className="hover:text-[#7474E8]">Controllo</a>
              <a href="#funzioni" className="hover:text-[#7474E8]">Funzioni</a>
              <a href="#inizia" className="hover:text-[#7474E8]">Inizia</a>
            </nav>
          </header>

          <div className="flex flex-1 items-center">
            <div className="max-w-4xl">
              <p className="mb-5 text-sm font-bold uppercase tracking-[0.25em] text-[#7474E8]">
                Smart Home Control
              </p>

              <h1 className="mb-7 text-5xl font-black leading-tight md:text-7xl">
                HomeHub
                <span className="block text-[#7474E8]">la tua casa connessa.</span>
              </h1>

              <p className="mb-10 max-w-3xl text-xl leading-relaxed text-[#6F778A] md:text-2xl">
                Gestisci luci, stanze, dispositivi e controlli della tua smart home
                da un’unica dashboard semplice, chiara e intuitiva.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <a
                  href="/login"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#7474E8] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-[#7474E8]/25 hover:bg-[#6767DD]"
                >
                  Unisciti a noi
                </a>

                <a
                  href="#funzioni"
                  className="inline-flex items-center justify-center rounded-2xl border border-[#7474E8]/40 bg-white px-8 py-4 text-lg font-bold text-[#7474E8] hover:bg-[#EEF0FF]"
                >
                  Scopri di più
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="controllo" className="bg-[#F6F8FE] px-6 py-24">
        <div className="mx-auto max-w-7xl rounded-3xl border border-[#E2E6F0] bg-white p-8 shadow-sm md:p-14">
          <h2 className="mb-6 text-4xl font-black md:text-5xl">
            Il controllo totale, ovunque tu sia
          </h2>

          <p className="mb-12 max-w-5xl text-xl leading-relaxed text-[#6F778A]">
            Con HomeHub hai una visione immediata della casa: dispositivi attivi,
            stanze, temperatura, umidità e funzioni principali sempre a portata di click.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <article className="rounded-3xl border border-[#E2E6F0] bg-[#F8FAFF] p-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7474E8]/10 text-3xl">
                ⚡
              </div>
              <h3 className="mb-3 text-2xl font-bold text-[#303746]">Risposta immediata</h3>
              <p className="text-lg leading-relaxed text-[#6F778A]">
                Controlla lo stato dei dispositivi e consulta le informazioni principali senza passaggi inutili.
              </p>
            </article>

            <article className="rounded-3xl border border-[#E2E6F0] bg-[#F8FAFF] p-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7474E8]/10 text-3xl">
                🏠
              </div>
              <h3 className="mb-3 text-2xl font-bold text-[#303746]">Casa organizzata</h3>
              <p className="text-lg leading-relaxed text-[#6F778A]">
                Dividi la smart home in stanze e controlla quanti dispositivi sono attivi in ogni ambiente.
              </p>
            </article>

            <article className="rounded-3xl border border-[#E2E6F0] bg-[#F8FAFF] p-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7474E8]/10 text-3xl">
                🔒
              </div>
              <h3 className="mb-3 text-2xl font-bold text-[#303746]">Interfaccia chiara</h3>
              <p className="text-lg leading-relaxed text-[#6F778A]">
                Una grafica ordinata rende più leggibili comandi, stanze e dati importanti.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="funzioni" className="bg-[#EEF2FB] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-5 text-4xl font-black md:text-5xl">
            Tutto quello che puoi fare con HomeHub
          </h2>

          <p className="mb-14 max-w-5xl text-xl leading-relaxed text-[#6F778A]">
            Una sola interfaccia per monitorare gli ambienti, gestire più dispositivi insieme
            e controllare le informazioni tecniche dell’app.
          </p>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <article>
              <div className="mb-6 rounded-3xl border border-[#E2E6F0] bg-white p-3 shadow-sm">
                <img
                  src="/homehub-dashboard.png"
                  alt="Dashboard di HomeHub"
                  className="h-40 w-full rounded-2xl object-cover opacity-90"
                />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-[#303746]">Dashboard</h3>
              <p className="text-lg leading-relaxed text-[#6F778A]">
                Visualizza temperatura, umidità, dispositivi accesi e avvisi attivi.
              </p>
            </article>

            <article>
              <div className="mb-6 rounded-3xl border border-[#E2E6F0] bg-white p-3 shadow-sm">
                <img
                  src="/homehub-rooms.png"
                  alt="Pagina Rooms di HomeHub"
                  className="h-40 w-full rounded-2xl object-cover opacity-90"
                />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-[#303746]">Rooms</h3>
              <p className="text-lg leading-relaxed text-[#6F778A]">
                Organizza ogni ambiente e controlla rapidamente i dispositivi collegati.
              </p>
            </article>

            <article>
              <div className="mb-6 rounded-3xl border border-[#E2E6F0] bg-white p-3 shadow-sm">
                <img
                  src="/homehub-batch.png"
                  alt="Batch Control di HomeHub"
                  className="h-40 w-full rounded-2xl object-cover opacity-90"
                />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-[#303746]">Batch Control</h3>
              <p className="text-lg leading-relaxed text-[#6F778A]">
                Seleziona più dispositivi e applica un’azione comune in pochi secondi.
              </p>
            </article>

            <article>
              <div className="mb-6 rounded-3xl border border-[#E2E6F0] bg-white p-3 shadow-sm">
                <img
                  src="/homehub-network.png"
                  alt="Network Inspector di HomeHub"
                  className="h-40 w-full rounded-2xl object-cover opacity-90"
                />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-[#303746]">Network</h3>
              <p className="text-lg leading-relaxed text-[#6F778A]">
                Monitora richieste, stati e dati scambiati tra client e server.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-6 py-28">
        <img
          src="/homehub-dashboard.png"
          alt="Dashboard HomeHub in background"
          className="absolute inset-0 h-full w-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-[#F6F8FE]/92" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <h2 className="mb-8 text-4xl font-black md:text-5xl">
            Un design che si adatta a te
          </h2>

          <p className="mb-12 max-w-5xl text-xl leading-relaxed text-[#6F778A]">
            Lo stile di HomeHub riprende la dashboard dell’app: sfondo chiaro,
            card arrotondate, icone pulite e colore viola per evidenziare le azioni importanti.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <article className="border-l-4 border-[#7474E8] bg-white p-8 shadow-sm">
              <h3 className="mb-4 text-2xl font-bold text-[#303746]">Interfaccia minimale</h3>
              <p className="text-lg leading-relaxed text-[#6F778A]">
                Le sezioni principali sono separate in modo ordinato e facilmente leggibile.
              </p>
            </article>

            <article className="border-l-4 border-[#9A83F4] bg-white p-8 shadow-sm">
              <h3 className="mb-4 text-2xl font-bold text-[#303746]">Comandi rapidi</h3>
              <p className="text-lg leading-relaxed text-[#6F778A]">
                Pulsanti e link sono pensati per rendere immediate le azioni più frequenti.
              </p>
            </article>

            <article className="border-l-4 border-[#7C8CF8] bg-white p-8 shadow-sm">
              <h3 className="mb-4 text-2xl font-bold text-[#303746]">Struttura responsive</h3>
              <p className="text-lg leading-relaxed text-[#6F778A]">
                Il layout usa griglie e colonne che si adattano alla dimensione dello schermo.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="inizia" className="bg-[#EEF2FB] px-6 py-28">
        <div className="mx-auto max-w-7xl rounded-3xl border border-[#7474E8]/30 bg-white p-10 text-center shadow-sm md:p-16">
          <h2 className="mb-6 text-4xl font-black md:text-6xl">
            Gestisci anche tu casa tua con un click
          </h2>

          <p className="mx-auto mb-10 max-w-4xl text-xl leading-relaxed text-[#6F778A]">
            Porta controllo, semplicità e organizzazione nella tua smart home con HomeHub.
          </p>

          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl bg-[#7474E8] px-10 py-4 text-lg font-bold text-white shadow-lg shadow-[#7474E8]/25 hover:bg-[#6767DD]"
          >
            Unisciti a noi
          </a>
        </div>
      </section>
    </main>
  );
}