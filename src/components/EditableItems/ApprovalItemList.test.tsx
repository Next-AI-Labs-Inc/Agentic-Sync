import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ApprovalItemList from './ApprovalItemList';
import { ItemWithStatus } from '@/types';

describe('ApprovalItemList', () => {
  const mockItems: ItemWithStatus[] = [
    {
      id: 'item1',
      content: 'Requirement 1',
      status: 'proposed',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    },
    {
      id: 'item2',
      content: 'Requirement 2',
      status: 'approved',
      createdAt: '2023-01-02T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
      approvedAt: '2023-01-03T00:00:00.000Z'
    }
  ];

  const mockOnUpdate = jest.fn();
  const mockOnApprove = jest.fn();
  const mockOnVeto = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly in interactive mode', () => {
    render(
      <ApprovalItemList
        label="Requirements"
        items={mockItems}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
        onVeto={mockOnVeto}
      />
    );

    // Check label
    expect(screen.getByText('Requirements')).toBeInTheDocument();
    
    // Check items content
    expect(screen.getByText('Requirement 1')).toBeInTheDocument();
    expect(screen.getByText('Requirement 2')).toBeInTheDocument();
    
    // Check approved badge
    expect(screen.getByText('Approved')).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByText('Add')).toBeInTheDocument();
    expect(screen.getByTestId('approve-btn-0')).toBeInTheDocument();
    expect(screen.getByTestId('veto-btn-0')).toBeInTheDocument();
    
    // Approve/Veto buttons should be enabled for proposed items
    expect(screen.getByTestId('approve-btn-0')).not.toBeDisabled();
    expect(screen.getByTestId('veto-btn-0')).not.toBeDisabled();
  });

  it('renders correctly in read-only mode', () => {
    render(
      <ApprovalItemList
        label="Requirements"
        items={mockItems}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
        onVeto={mockOnVeto}
        readOnly={true}
      />
    );

    // Check label and items still show
    expect(screen.getByText('Requirements')).toBeInTheDocument();
    expect(screen.getByText('Requirement 1')).toBeInTheDocument();
    expect(screen.getByText('Requirement 2')).toBeInTheDocument();
    
    // Check approved badge still shows
    expect(screen.getByText('Approved')).toBeInTheDocument();
    
    // Check buttons are all disabled
    expect(screen.getByText('Add')).toBeDisabled();
    expect(screen.getByTestId('approve-btn-0')).toBeDisabled();
    expect(screen.getByTestId('veto-btn-0')).toBeDisabled();
  });

  it('calls onApprove when approve button is clicked in interactive mode', () => {
    render(
      <ApprovalItemList
        label="Requirements"
        items={mockItems}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
        onVeto={mockOnVeto}
      />
    );

    fireEvent.click(screen.getByTestId('approve-btn-0'));
    expect(mockOnApprove).toHaveBeenCalledWith('item1');
  });

  it('calls onVeto when veto button is clicked in interactive mode', () => {
    render(
      <ApprovalItemList
        label="Requirements"
        items={mockItems}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
        onVeto={mockOnVeto}
      />
    );

    fireEvent.click(screen.getByTestId('veto-btn-0'));
    expect(mockOnVeto).toHaveBeenCalledWith('item1');
  });

  it('does not call handlers when buttons are clicked in read-only mode', () => {
    render(
      <ApprovalItemList
        label="Requirements"
        items={mockItems}
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
        onVeto={mockOnVeto}
        readOnly={true}
      />
    );

    // These clicks should have no effect
    fireEvent.click(screen.getByTestId('approve-btn-0'));
    fireEvent.click(screen.getByTestId('veto-btn-0'));
    
    // Handlers should not be called
    expect(mockOnApprove).not.toHaveBeenCalled();
    expect(mockOnVeto).not.toHaveBeenCalled();
  });
});