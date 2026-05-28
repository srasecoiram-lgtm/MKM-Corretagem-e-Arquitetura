import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import "../styles/CadastrarImoveis.css";
import axios from "axios";

export default function EditarImovel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titulo: "",
    imagem: "",
    endereco: "",
    metragem: "",
    status: "",
    preco: "",
    descricao: ""
  });

  useEffect(() => {
    axios.get(`http://localhost:3000/imoveis/${id}`)
      .then((res) => setFormData(res.data))
      .catch((err) => console.error("Erro ao buscar imóvel:", err));
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/imoveis/${id}`, formData);
      alert("Imóvel atualizado com sucesso!");
      navigate("/admin");
    } catch (error) {
      alert("Erro ao atualizar o imóvel.");
      console.error(error);
    }
  };

  return (
    <div className="cadastrar-container">
      <Header />
      <div className="form-container">
        <h2>Editar Imóvel</h2>
        <form onSubmit={handleSubmit} className="formulario">
          <label>Título:</label>
          <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} required />

          <label>Imagem (URL):</label>
          <input type="text" name="imagem" value={formData.imagem} onChange={handleChange} required />

          <label>Endereço:</label>
          <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} required />

          <label>Metragem (m²):</label>
          <input type="number" name="metragem" value={formData.metragem} onChange={handleChange} required />

          <label>Status:</label>
          <select name="status" value={formData.status} onChange={handleChange} required>
            <option value="">Selecione</option>
            <option value="Disponível">Disponível</option>
            <option value="Vendido">Vendido</option>
            <option value="Alugado">Alugado</option>
          </select>

          <label>Preço (R$):</label>
          <input type="number" name="preco" value={formData.preco} onChange={handleChange} required />

          <label>Descrição:</label>
          <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows="5" required />

          <button type="submit">Salvar Alterações</button>
        </form>
      </div>
    </div>
  );
}
