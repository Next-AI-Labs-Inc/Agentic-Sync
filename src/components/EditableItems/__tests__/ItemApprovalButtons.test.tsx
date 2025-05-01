import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ItemApprovalButtons from '../ItemApprovalButtons';

/**
 * UX IMPACT: These tests ensure that the approval/veto buttons behave correctly,
 * which affects users' ability to manage content in task requirements, technical plans,
 * and next steps.
 * 
 * TECHNICAL CONTEXT: Tests the isolated ItemApprovalButtons component to ensure
 * it correctly renders and triggers approve/veto actions.
 */
describe('ItemApprovalButtons', () => {
  const mockOnApprove = jest.fn().mockImplementation(() => jest.fn().mockResolvedValue(undefined));
  const mockOnVeto = jest.fn().mockImplementation(() => jest.fn().mockResolvedValue(undefined));
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders approve and veto buttons', () => {
    render(
      <ItemApprovalButtons
        itemId="test-item-1"
        index={0}
        isProcessing={false}
        onApprove={mockOnApprove}
        onVeto={mockOnVeto}
      />
    );
    
    expect(screen.getByTestId('approve-btn-0')).toBeInTheDocument();
    expect(screen.getByTestId('veto-btn-0')).toBeInTheDocument();
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Veto')).toBeInTheDocument();
  });
  
  test('calls onApprove when approve button is clicked', () => {
    render(
      <ItemApprovalButtons
        itemId="test-item-1"
        index={0}
        isProcessing={false}
        onApprove={mockOnApprove}
        onVeto={mockOnVeto}
      />
    );
    
    fireEvent.click(screen.getByTestId('approve-btn-0'));
    
    expect(mockOnApprove).toHaveBeenCalledWith('test-item-1');
    // The returned function from mockOnApprove should also be called
    expect(mockOnApprove).toHaveBeenCalledTimes(1);
  });
  
  test('calls onVeto when veto button is clicked', () => {
    render(
      <ItemApprovalButtons
        itemId="test-item-1"
        index={0}
        isProcessing={false}
        onApprove={mockOnApprove}
        onVeto={mockOnVeto}
      />
    );
    
    fireEvent.click(screen.getByTestId('veto-btn-0'));
    
    expect(mockOnVeto).toHaveBeenCalledWith('test-item-1');
    // The returned function from mockOnVeto should also be called
    expect(mockOnVeto).toHaveBeenCalledTimes(1);
  });
  
  test('disables buttons when processing', () => {
    render(
      <ItemApprovalButtons
        itemId="test-item-1"
        index={0}
        isProcessing={true}
        onApprove={mockOnApprove}
        onVeto={mockOnVeto}
      />
    );
    
    expect(screen.getByTestId('approve-btn-0')).toBeDisabled();
    expect(screen.getByTestId('veto-btn-0')).toBeDisabled();
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });
  
  test('renders with correct index in test IDs', () => {
    render(
      <ItemApprovalButtons
        itemId="test-item-1"
        index={5}
        isProcessing={false}
        onApprove={mockOnApprove}
        onVeto={mockOnVeto}
      />
    );
    
    expect(screen.getByTestId('approval-buttons-5')).toBeInTheDocument();
    expect(screen.getByTestId('approve-btn-5')).toBeInTheDocument();
    expect(screen.getByTestId('veto-btn-5')).toBeInTheDocument();
  });
});