import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import SearchBar from "./components/SearchBar";
import ListarImoveis from "./pages/ListarImoveis";
import ConteudoPublico from "./components/ConteudoPublico";
import Markdown from "./components/Markdown";
import ImovelCard from "./components/ImovelCard";
import Contato from "./pages/Contato";
import Favoritos from "./pages/Favoritos";
import api from "./services/api";

jest.mock("./components/Header", () => () => null);
jest.mock("./components/Footer", () => () => null);
jest.mock("./services/api", () => ({
  __esModule: true,
  default: { get: jest.fn() },
  mediaUrl: () => "",
}));

beforeEach(() => api.get.mockReset());

test("leva busca, finalidade, preço e quartos da home à listagem", async () => {
  api.get.mockResolvedValue({ data: [] });
  render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<SearchBar />} />
        <Route path="/imoveis" element={<ListarImoveis />} />
      </Routes>
    </MemoryRouter>
  );
  fireEvent.click(screen.getByRole("button", { name: "Alugar" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Buscar imóveis" }), { target: { value: "Guilhermina" } });
  fireEvent.click(screen.getByRole("button", { name: "Filtros" }));
  fireEvent.change(screen.getByRole("spinbutton", { name: "Valor mínimo" }), { target: { value: "1500" } });
  fireEvent.click(screen.getAllByRole("button", { name: "4+" })[0]);
  fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

  await screen.findByText("Nenhum imóvel encontrado com esses filtros.");
  expect(api.get.mock.calls[0][0]).toBe("/imoveis");
  expect(api.get.mock.calls[0][1].params).toMatchObject({
    q: "Guilhermina", finalidade: "Aluguel", precoMin: "1500", quartos: "4+",
  });
  expect(api.get.mock.calls[0][1].params).not.toHaveProperty("metragemMin");
});

test("mostra o artigo publicado e recusa conteúdo de outra seção", async () => {
  api.get.mockResolvedValue({ data: { id: 7, secao: "blog", titulo: "Artigo MKM", conteudo: "## Conteúdo completo" } });
  const routes = (url, section) => (
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/:secao/:id" element={<ConteudoPublico section={section} title="MKM" description="" />} />
      </Routes>
    </MemoryRouter>
  );
  const page = render(routes("/blog/7", "blog"));
  expect(await screen.findByRole("heading", { name: "Artigo MKM" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Conteúdo completo" })).toBeInTheDocument();
  page.unmount();
  render(routes("/arquitetura/7", "arquitetura"));
  expect(await screen.findByRole("alert")).toHaveTextContent("Artigo não encontrado.");
});

test("renderiza Markdown sem interpretar elementos HTML do conteúdo", () => {
  const { container } = render(<Markdown text={"**Texto**\n<img alt='não executar' />"} />);
  expect(screen.getByText("Texto").tagName).toBe("STRONG");
  expect(container.querySelector("img")).toBeNull();
  expect(screen.getByText("<img alt='não executar' />")).toBeInTheDocument();
});

test("salva e remove favoritos no navegador e na página de favoritos", async () => {
  const property = { id: 100, edificio: "Imóvel de teste", finalidade: "Venda" };
  api.get.mockResolvedValue({ data: [property] });
  const view = render(<MemoryRouter>
    <ImovelCard imovel={property} />
  </MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Adicionar aos favoritos" }));
  expect(JSON.parse(localStorage.getItem("mkm.favoritos"))).toEqual(["100"]);
  view.unmount();

  render(<MemoryRouter>
    <Favoritos />
  </MemoryRouter>);
  expect(await screen.findByRole("heading", { name: "Imóvel de teste" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Remover dos favoritos" }));
  expect(screen.getByText("Você ainda não salvou imóveis.")).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem("mkm.favoritos"))).toEqual([]);
});

test("prepara o contato no WhatsApp sem indicar que foi enviado", () => {
  const open = jest.spyOn(window, "open").mockImplementation(() => null);
  try {
    render(<Contato />);
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Pessoa Teste" } });
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "teste@example.org" } });
    fireEvent.change(screen.getByLabelText("Mensagem"), { target: { value: "Gostaria de agendar uma visita." } });
    fireEvent.click(screen.getByRole("button", { name: "Abrir no WhatsApp" }));
    expect(screen.getByRole("status")).toHaveTextContent("Revise e envie");
    const url = new URL(open.mock.calls[0][0]);
    expect(url.hostname).toBe("wa.me");
    expect(url.searchParams.get("text")).toContain("Gostaria de agendar uma visita.");
  } finally {
    open.mockRestore();
  }
});
