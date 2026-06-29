describe('DataShare E2E', () => {

  it('Scénario 1 — Page accueil accessible', () => {
    cy.visit('http://localhost:5173')
    cy.contains('Tu veux partager un fichier ?').should('be.visible')
    cy.contains('Se connecter').should('be.visible')
  })

  it('Scénario 2 — Formulaire login visible et fonctionnel', () => {
    cy.visit('http://localhost:5173/login')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('input[type="email"]').type('demo@datashare.com')
    cy.get('input[type="password"]').type('password123')
    cy.contains('Connexion').should('be.visible')
  })

  it('Scénario 3 — Page téléchargement lien invalide', () => {
    cy.visit('http://localhost:5173/d/token-invalide-123')
    cy.contains('Ce lien est invalide').should('be.visible')
  })

  it('Scénario 4 — Parcours complet : inscription, téléversement, lien, téléchargement', () => {
    const email = `e2e_${Date.now()}@datashare.com`

    // 1) Inscription via le vrai formulaire (le serveur pose le cookie HttpOnly)
    cy.visit('/login')
    cy.contains('Créer un compte').click()
    cy.get('#login-email').type(email)
    cy.get('#login-password').type('password123')
    cy.get('#login-confirm').type('password123')
    cy.contains('Créer mon compte').click()

    // 2) Redirigé vers l'accueil, on téléverse un fichier
    cy.contains('Tu veux partager un fichier ?', { timeout: 10000 }).should('be.visible')
    cy.get('input[type="file"]').first().selectFile(
      { contents: Cypress.Buffer.from('contenu de test bout-en-bout'), fileName: 'rapport-e2e.txt' },
      { force: true },
    )
    cy.contains('Téléverser').click()

    // 3) Le lien de partage s'affiche
    cy.contains('Copier le lien', { timeout: 10000 }).should('be.visible')

    // 4) On ouvre le lien et on vérifie que le fichier est bien proposé au téléchargement
    cy.get('a[href*="/d/"]').invoke('attr', 'href').then((href) => {
      cy.visit(String(href))
      cy.contains('rapport-e2e.txt', { timeout: 10000 }).should('be.visible')
      cy.contains('Télécharger').should('be.visible').click()
    })

    // 5) L'espace personnel (US05) liste le fichier et permet de copier son lien
    cy.visit('/my-space')
    cy.contains('rapport-e2e.txt', { timeout: 10000 }).should('be.visible')
    cy.window().then((win) => {
      if (win.navigator.clipboard) cy.stub(win.navigator.clipboard, 'writeText').resolves()
    })
    cy.contains('button', 'Copier le lien').first().click()
    cy.contains('Lien copié').should('be.visible')
  })

})
