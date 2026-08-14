import { it, expect, describe, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { userEvent } from "@testing-library/user-event";
import { Provider } from "react-redux";
import axios from "axios";
import type { AxiosResponse } from "axios";
import { HomePage } from "./HomePage";
import { store } from "../../store/store";

vi.mock("axios");

const mockResponse = <T,>(data: T) => ({ data }) as AxiosResponse<T>;

describe("HomePage component", () => {
  beforeEach(() => {
    vi.mocked(axios.get).mockImplementation(async (urlPath: string) => {
      if (urlPath === "/api/products") {
        return mockResponse([
          {
            id: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
            image: "images/products/athletic-cotton-socks-6-pairs.jpg",
            name: "Black and Gray Athletic Cotton Socks - 6 Pairs",
            rating: {
              stars: 4.5,
              count: 87,
            },
            priceCents: 1090,
            keywords: ["socks", "sports", "apparel"],
          },
          {
            id: "15b6fc6f-327a-4ec4-896f-486349e85a3d",
            image: "images/products/intermediate-composite-basketball.jpg",
            name: "Intermediate Size Basketball",
            rating: {
              stars: 4,
              count: 127,
            },
            priceCents: 2095,
            keywords: ["sports", "basketballs"],
          },
        ]);
      }
      return mockResponse([]);
    });
    vi.mocked(axios.post).mockResolvedValue(mockResponse({}));
  });

  it("displays the products correct", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </Provider>,
    );
    const productContainers = await screen.findAllByTestId("product-container");

    expect(productContainers.length).toBe(2);

    expect(
      within(productContainers[0]).getByText(
        "Black and Gray Athletic Cotton Socks - 6 Pairs",
      ),
    ).toBeInTheDocument();

    expect(
      within(productContainers[1]).getByText("Intermediate Size Basketball"),
    ).toBeInTheDocument();
  });

  it("adds a product to the cart", async () => {
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </Provider>,
    );

    const productContainers = await screen.findAllByTestId("product-container");
    await user.click(
      within(productContainers[0]).getByRole("button", { name: "Add to Cart" }),
    );

    expect(vi.mocked(axios.post)).toHaveBeenCalledWith("/api/cart-items", {
      productId: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
      quantity: 1,
    });
  });
});
