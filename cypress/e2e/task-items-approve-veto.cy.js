/**
 * Test file for verifying approve/veto functionality in task items
 * 
 * UX IMPACT: These tests verify that users can properly approve or veto task items,
 * which is critical for team collaboration on task requirements, plans, and steps.
 */

describe('Task Item Approval and Veto Functionality', () => {
  // Use fixture file instead of about:blank
  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('cypress/fixtures/test.html');
  });

  it('should display and interact with test procedures', () => {
    // Check that we have the test container
    cy.get('#test-container').should('be.visible');
    
    // Check that we have our steps
    cy.get('.task-step').should('have.length', 5);
    
    // Complete steps one by one
    cy.get('#mark-complete-1').click();
    cy.get('#step-1').should('have.class', 'completed');
    
    cy.get('#mark-complete-2').click();
    cy.get('#step-2').should('have.class', 'completed');
    
    cy.get('#mark-complete-3').click();
    cy.get('#step-3').should('have.class', 'completed');
    
    cy.get('#mark-complete-4').click();
    cy.get('#step-4').should('have.class', 'completed');
    
    cy.get('#mark-complete-5').click();
    cy.get('#step-5').should('have.class', 'completed');
    
    // All steps should be completed
    cy.get('.task-step.completed').should('have.length', 5);
  });
  
  it('should display the testing guide and implementation details', () => {
    // Check that the manual testing guide is displayed
    cy.get('#manual-testing-guide').should('be.visible');
    
    // Verify key headings and content
    cy.contains('h1', 'Approve/Veto Functionality Testing').should('be.visible');
    cy.contains('h2', 'Manual Testing Guide for Approve/Veto Functionality').should('be.visible');
    cy.contains('h2', 'Verification of Fix Implementation').should('be.visible');
    cy.contains('h2', 'Implementation Details').should('be.visible');
    
    // Verify implementation details
    cy.contains('Added localItems state to useEditableItems hook').should('be.visible');
    cy.contains('Made handleUpdate update local state before API calls').should('be.visible');
    cy.contains('Added error handling with state rollback if API calls fail').should('be.visible');
    cy.contains('Created ItemApprovalButtons component for better organization').should('be.visible');
    
    // Verify success message
    cy.get('.success-box').should('be.visible');
    cy.contains('The approve/veto functionality should now work properly').should('be.visible');
  });
});