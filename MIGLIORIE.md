# Migliorie possibili dopo la v4

Queste proposte derivano dall'esame della guida e del codice attuali. Non sono già implementate nel pacchetto GoLive. La priorità indica l'ordine consigliato di valutazione, non una severità Nielsen assegnata senza evidenze.

| Priorità | Intervento | Evidenza nello stato attuale | Risultato da verificare |
|---|---|---|---|
| Alta | Verifica con tecnologie assistive e browser aggiuntivi | I controlli disponibili riguardano Chromium; manca un audit completo con screen reader | Completare ricerca, quiz ed esportazione con tastiera e screen reader; verificare focus, messaggi, zoom e reflow in Firefox e Safari |
| Alta | Modifica e recupero delle valutazioni | La scheda consente aggiunta, rimozione ed esportazione; non modifica una voce esistente e perde i dati al reload | Correggere un finding conservando l'ID; importare il CSV esportato; valutare salvataggio locale opzionale con consenso esplicito e cancellazione chiara |
| Media | Ricerca con tutti i risultati raggiungibili | L'interfaccia mostra al massimo i primi 15 passaggi corrispondenti | Aggiungere “Mostra altri” o paginazione accessibile; ogni risultato deve essere raggiungibile e portare al passaggio pertinente |
| Media | Esercizi di ragionamento e trasferimento | Il quiz assegna il punteggio sulla sola euristica scelta; il caso completo è bancario | Aggiungere un caso non finanziario e campi per conseguenza, proposta e motivazione; conservare la possibilità di risposte alternative giustificate |
| Media | Generazione meno dipendente dalla forma del Markdown | Il generatore riconosce sezioni e dati attraverso titoli e pattern testuali specifici | Introdurre dati strutturati o un parser più robusto; segnalare esplicitamente sezioni mancanti e mantenere sincronizzati HTML, quiz e CSV dopo modifiche editoriali |
| Opzionale | Versione italiana coerente | Testo e interfaccia sono in inglese | Tradurre guida, messaggi e quiz insieme; verificare terminologia e comprensione con il pubblico previsto |

## Ordine pratico

1. Eseguire le verifiche di accessibilità e browser sui task principali, correggendo eventuali problemi osservati.
2. Migliorare la scheda di valutazione se viene usata su progetti reali: modifica, importazione e recupero evitano di ripetere il lavoro.
3. Rendere raggiungibili tutti i risultati di ricerca e rafforzare gli esercizi.
4. Consolidare il generatore quando la guida verrà aggiornata frequentemente; aggiungere la traduzione se il pubblico ne ha bisogno.

La revisione non identifica nuove evidenze di un problema bloccante per la pubblicazione. Le verifiche mancanti restano limiti del livello di garanzia disponibile, e i test con utenti rappresentativi possono modificare queste priorità.
