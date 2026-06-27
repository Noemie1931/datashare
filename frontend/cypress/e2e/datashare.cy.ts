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

})
