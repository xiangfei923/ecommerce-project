import { it, expect, describe, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Provider } from 'react-redux';
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { Product } from './Product';
import { store } from '../../store/store';
import type { ProductType } from '../../types';

vi.mock('axios');

const mockResponse = <T,>(data: T) => ({ data }) as AxiosResponse<T>;

describe('Product component', () => {
  let product: ProductType;

  beforeEach(() => {
    product = {
      id: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
      image: "images/products/athletic-cotton-socks-6-pairs.jpg",
      name: "Black and Gray Athletic Cotton Socks - 6 Pairs",
      rating: {
        stars: 4.5,
        count: 87
      },
      priceCents: 1090,
      keywords: ["socks", "sports", "apparel"]
    };

    vi.mocked(axios.post).mockResolvedValue(mockResponse({}));
    vi.mocked(axios.get).mockResolvedValue(mockResponse([]));
  });

  const renderProduct = () =>
    render(
      <Provider store={store}>
        <Product product={product} />
      </Provider>
    );

  it('displays the product details correctly', () => {
    renderProduct();

    expect(
      screen.getByText('Black and Gray Athletic Cotton Socks - 6 Pairs')
    ).toBeInTheDocument();

    expect(
      screen.getByText('$10.90')
    ).toBeInTheDocument();

    expect(
      screen.getByTestId('product-image')
    ).toHaveAttribute('src', 'images/products/athletic-cotton-socks-6-pairs.jpg');

    expect(
      screen.getByTestId('product-rating-stars-image')
    ).toHaveAttribute('src', 'images/ratings/rating-45.png');

    expect(
      screen.getByText('87')
    ).toBeInTheDocument();
  });

  it('adds a product to the cart', async () => {
    const user = userEvent.setup();
    renderProduct();

    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    expect(vi.mocked(axios.post)).toHaveBeenCalledWith(
      '/api/cart-items',
      {
        productId: 'e43638ce-6aa0-4b85-b27f-e1d07eb678c6',
        quantity: 1
      }
    );
  });
});
