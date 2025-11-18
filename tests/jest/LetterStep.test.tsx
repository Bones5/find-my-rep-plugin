import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LetterStep } from '../../src/components/LetterStep';
import type { Representative } from '../../src/types';

describe('LetterStep Component', () => {
  const mockSelectedReps: Representative[] = [
    {
      name: 'John Smith',
      email: 'john@example.com',
      title: 'Member of Parliament',
      type: 'MP'
    }
  ];

  const mockOnSend = jest.fn();
  const defaultProps = {
    selectedReps: mockSelectedReps,
    letterTemplate: 'Dear {{representative_name}},\n\nTest letter content.',
    onSend: mockOnSend,
    loading: false,
  };

  beforeEach(() => {
    mockOnSend.mockClear();
  });

  test('renders the letter step with initial template', () => {
    render(<LetterStep {...defaultProps} />);
    
    expect(screen.getByLabelText(/Your Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Email:/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Your Name:/i })).toBeInTheDocument();
    
    const textarea = screen.getByDisplayValue(/Dear {{representative_name}}/i);
    expect(textarea).toBeInTheDocument();
  });

  test('shows validation alert when name is empty', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<LetterStep {...defaultProps} />);
    
    const sendButton = screen.getByRole('button', { name: /Send/i });
    fireEvent.click(sendButton);
    
    expect(alertSpy).toHaveBeenCalledWith('Please fill in all fields.');
    expect(mockOnSend).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  test('shows validation alert when email is empty', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<LetterStep {...defaultProps} />);
    
    const nameInput = screen.getByLabelText(/Your Name:/i);
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    
    const sendButton = screen.getByRole('button', { name: /Send/i });
    fireEvent.click(sendButton);
    
    expect(alertSpy).toHaveBeenCalledWith('Please fill in all fields.');
    expect(mockOnSend).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  test('shows validation alert when email is invalid', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<LetterStep {...defaultProps} />);
    
    const nameInput = screen.getByLabelText(/Your Name:/i);
    const emailInput = screen.getByLabelText(/Your Email:/i);
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const sendButton = screen.getByRole('button', { name: /Send/i });
    fireEvent.click(sendButton);
    
    expect(alertSpy).toHaveBeenCalledWith('Please enter a valid email address.');
    expect(mockOnSend).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  test('calls onSend with correct data when form is valid', () => {
    render(<LetterStep {...defaultProps} />);
    
    const nameInput = screen.getByLabelText(/Your Name:/i);
    const emailInput = screen.getByLabelText(/Your Email:/i);
    const letterTextarea = screen.getByDisplayValue(/Dear {{representative_name}}/i);
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(letterTextarea, { target: { value: 'Updated letter content' } });
    
    const sendButton = screen.getByRole('button', { name: /Send/i });
    fireEvent.click(sendButton);
    
    expect(mockOnSend).toHaveBeenCalledWith(
      'Test User',
      'test@example.com',
      'Updated letter content'
    );
  });

  test('displays "Sending..." when loading', () => {
    render(<LetterStep {...defaultProps} loading={true} />);
    
    const sendButton = screen.getByRole('button', { name: /Sending.../i });
    expect(sendButton).toBeDisabled();
  });

  test('displays success message when provided', () => {
    render(<LetterStep {...defaultProps} success="Letters sent successfully!" />);
    
    expect(screen.getByText('Letters sent successfully!')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Send/i })).not.toBeInTheDocument();
  });

  test('disables inputs when loading', () => {
    render(<LetterStep {...defaultProps} loading={true} />);
    
    const nameInput = screen.getByLabelText(/Your Name:/i);
    const emailInput = screen.getByLabelText(/Your Email:/i);
    const letterTextarea = screen.getByDisplayValue(/Dear {{representative_name}}/i);
    
    expect(nameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(letterTextarea).toBeDisabled();
  });

  test('disables inputs when success is shown', () => {
    render(<LetterStep {...defaultProps} success="Success!" />);
    
    const nameInput = screen.getByLabelText(/Your Name:/i);
    const emailInput = screen.getByLabelText(/Your Email:/i);
    const letterTextarea = screen.getByDisplayValue(/Dear {{representative_name}}/i);
    
    expect(nameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(letterTextarea).toBeDisabled();
  });

  test('send button has send-button class for testing', () => {
    render(<LetterStep {...defaultProps} />);
    
    const sendButton = screen.getByRole('button', { name: /Send/i });
    expect(sendButton).toHaveClass('send-button');
  });

  test('allows editing letter content', () => {
    render(<LetterStep {...defaultProps} />);
    
    const letterTextarea = screen.getByDisplayValue(/Dear {{representative_name}}/i);
    const newContent = 'Completely new letter';
    
    fireEvent.change(letterTextarea, { target: { value: newContent } });
    
    expect(screen.getByDisplayValue(newContent)).toBeInTheDocument();
  });
});
