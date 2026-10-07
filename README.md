# GoLive — Nielsen Field Guide, edizione 4

Pacchetto statico pronto per la pubblicazione. La guida e l'interfaccia sono in inglese, come l'originale; queste istruzioni sono in italiano.

## Contenuto

- `index.html`: documento HTML5 interattivo e responsive.
- `nielsen-10-heuristics-guide-v4.md`: guida Markdown aggiornata.
- `assets/style.css`, `assets/app.js`, `assets/favicon.svg`: stile, interazioni e icona. Mantenere la cartella `assets` accanto all'HTML.
- `nielsen-flashcards.csv`: flashcard da importare in Anki.
- `evaluation-template.csv`: modello di valutazione euristica.
- `.nojekyll`: disabilita l'elaborazione Jekyll per questo pacchetto statico.
- `checksums.md5`: checksum MD5 dei file distribuiti, escluso il manifesto stesso.
- `MIGLIORIE.md`: interventi ulteriori proposti, non ancora implementati.

## Anteprima

Aprire `index.html` in un browser. Il documento funziona anche senza un server; ricerca, quiz, flashcard e CSV vengono gestiti localmente. Le schede di valutazione rimangono nella memoria della scheda del browser: esportarle prima di chiudere o ricaricare.

## Pubblicazione su GitHub Pages

1. Copiare **il contenuto** di questa cartella nella radice del branch scelto del repository GitHub, conservando `assets/` e i file nascosti come `.nojekyll`.
2. Aprire **Settings → Pages → Build and deployment**.
3. Selezionare **Deploy from a branch**, il branch contenente i file (normalmente `main`) e **/(root)**, quindi salvare.
4. Aprire l'indirizzo mostrato da GitHub dopo il completamento della pubblicazione.

Non basta caricare soltanto l'HTML: perderebbe stile e interazioni. Se si conserva `GoLive/` come sottocartella di un sito pubblicato dalla radice, il documento si trova all'indirizzo relativo `GoLive/`; la configurazione da branch di Pages non offre `GoLive` come cartella sorgente dedicata.

[Istruzioni ufficiali di GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## Verifica MD5

Il formato è `checksum`, due spazi, percorso relativo. I checksum verificano l'integrità dei file trasferiti. In PowerShell, dalla cartella `GoLive`:

```powershell
Get-Content -LiteralPath './checksums.md5' | ForEach-Object {
    $parts = $_ -split '  ', 2
    $expected = $parts[0]
    $actual = (Get-FileHash -LiteralPath $parts[1] -Algorithm MD5).Hash.ToLowerInvariant()
    if ($actual -ne $expected) { throw "Checksum non corrispondente: $($parts[1])" }
}
```

Rigenerare il manifesto dopo ogni modifica a un file del pacchetto.

## Stato delle verifiche

La versione di origine è stata verificata in Chromium per interazioni, layout desktop/mobile fino a 320 px, lettura senza JavaScript, stampa e navigazione da tastiera dei controlli espandibili. Il confezionamento GoLive verifica la corrispondenza delle copie, i checksum e i riferimenti locali dell'HTML. Non è stato eseguito un audit completo di conformità WCAG, né una verifica completa in Safari e Firefox.

Il pacchetto non pubblica nulla automaticamente e non contiene strumenti di sviluppo, ambienti Python o dipendenze da installare sul server.
