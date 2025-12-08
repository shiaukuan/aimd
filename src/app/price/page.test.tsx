// ABOUTME: Unit tests for Price page using React Testing Library
// ABOUTME: Tests donation card rendering, QR code image, donation link, and thank you message

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PricePage from './page';

describe('PricePage', () => {
  it('should render donation card', () => {
    render(<PricePage />);

    const title = screen.getByRole('heading', { name: '捐款支持' });
    expect(title).toBeInTheDocument();
  });

  it('should render card description', () => {
    render(<PricePage />);

    const description = screen.getByText('您的支持是我們持續改進的動力');
    expect(description).toBeInTheDocument();
  });

  it('should display QR code image', () => {
    render(<PricePage />);

    const image = screen.getByAltText('捐款 QR Code');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('qrcode-donate'));
  });

  it('should display QR code image with correct dimensions', () => {
    render(<PricePage />);

    const image = screen.getByAltText('捐款 QR Code');
    expect(image).toHaveAttribute('width', '200');
    expect(image).toHaveAttribute('height', '200');
  });

  it('should have external donation link', () => {
    render(<PricePage />);

    const link = screen.getByRole('link', { name: /前往捐款頁面/ });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://p.ecpay.com.tw/500617F');
  });

  it('should open donation link in new tab', () => {
    render(<PricePage />);

    const link = screen.getByRole('link', { name: /前往捐款頁面/ });
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('should have secure external link attributes', () => {
    render(<PricePage />);

    const link = screen.getByRole('link', { name: /前往捐款頁面/ });
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should display thank you message', () => {
    render(<PricePage />);

    const thankYouMessage = screen.getByText('感謝 10 元捐款支持');
    expect(thankYouMessage).toBeInTheDocument();
  });

  it('should display additional support message', () => {
    render(<PricePage />);

    const supportMessage = screen.getByText('您的每一份心意都將用於改善產品體驗');
    expect(supportMessage).toBeInTheDocument();
  });

  it('should render within MainLayout', () => {
    render(<PricePage />);

    // Check for main element (from MainLayout)
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('should have proper card structure', () => {
    const { container } = render(<PricePage />);

    // Check for card elements (shadcn/ui Card components)
    const card = container.querySelector('[class*="border"]');
    expect(card).toBeInTheDocument();
  });
});
