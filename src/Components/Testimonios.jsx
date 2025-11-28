import React, { useEffect, useState, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Avatar,
  Rating,
  Typography,
  Box,
  Button as MuiButton,
  TextField,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Paper from "@mui/material/Paper";
import Draggable from "react-draggable";
import { toast } from "react-hot-toast";
import { getTestimonios, createTestimonio } from "../services/api";
import AuthModal from "./LoginModal";
import { useAuth } from "../Context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../css/Testimonios.css";
import { getUserImageUrl } from "../helpers/images"; // ✅ helper centralizado

// Fallback local
const testimoniosLocales = [
  {
    nombre: "Ana Pérez",
    texto: "¡Me encantó la calidad y el servicio!",
    imagen: "https://randomuser.me/api/portraits/women/44.jpg",
    detalle: "La atención al cliente fue excelente. Me ayudaron a escoger los muebles perfectos.",
    rating: 4.5,
    titulo: "Excelente experiencia",
  },
  {
    nombre: "Carlos López",
    texto: "Recomiendo esta tienda al 100%",
    imagen: "https://randomuser.me/api/portraits/men/32.jpg",
    detalle: "Envío rápido y productos tal como en las fotos. Muy satisfecho.",
    rating: 5,
    titulo: "Excelente experiencia",
  },
  {
    nombre: "Laura García",
    texto: "Decoré toda mi casa con ellos.",
    imagen: "https://randomuser.me/api/portraits/women/68.jpg",
    detalle: "Los asesores me guiaron muy bien, tienen estilo y precios justos.",
    rating: 4,
    titulo: "Buena experiencia",
  },
];

function PaperComponent(props) {
  const paperRef = useRef(null);
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
      nodeRef={paperRef}
    >
      <Paper ref={paperRef} {...props} />
    </Draggable>
  );
}

export default function Testimonios() {
  const [openDetail, setOpenDetail] = useState(false);
  const [selected, setSelected] = useState(null);
  const [testimonios, setTestimonios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [texto, setTexto] = useState("");
  const [titulo, setTitulo] = useState("");
  const [rating, setRating] = useState(0);
  const [imagen, setImagen] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    AOS.init({ duration: 1000 });
    fetchTestimonios();
  }, []);

  const fetchTestimonios = async () => {
    try {
      const res = await getTestimonios();
      let data = [];
      if (res.success && Array.isArray(res.data.data)) {
        data = res.data.data.map((t) => ({
          nombre: t.user?.name || "Usuario",
          texto: t.texto,
          imagen: getUserImageUrl(t.user), // ✅ Usamos helper
          detalle: t.texto,
          rating: t.rating,
          titulo: t.titulo,
        }));
      }
      setTestimonios([...data, ...testimoniosLocales]);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar los testimonios");
      setTestimonios(testimoniosLocales);
    }
  };

  const handleOpenDetail = (index) => {
    setSelected(index);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelected(null);
  };

  const handleOpenForm = () => {
    if (!user) {
      toast.error("Debes iniciar sesión para dejar un testimonio");
      setShowLogin(true);
    } else {
      setShowForm(true);
    }
  };

  const handleImageChange = (file) => {
    if (!file) return;
    setImagen(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmitTestimonio = async (e) => {
    e.preventDefault();
    if (!titulo) return toast.error("Debes seleccionar un título");
    if (!texto.trim()) return toast.error("El texto no puede estar vacío");
    if (rating <= 0) return toast.error("Selecciona una valoración");

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("texto", texto);
    formData.append("rating", rating);
    if (imagen) formData.append("imagen", imagen);

    const res = await createTestimonio(formData);

    if (res.success) {
      toast.success("¡Gracias por tu testimonio!");
      const t = res.data;
      const nuevo = {
        nombre: t.user?.name || user?.name || "Usuario",
        texto: t.texto,
        detalle: t.texto,
        titulo: t.titulo,
        rating: t.rating,
        imagen: getUserImageUrl(t.user || { photo: t.imagen }), // ✅ helper
      };
      setTestimonios((prev) => [nuevo, ...prev]);
      setShowForm(false);
      setTexto("");
      setTitulo("");
      setRating(0);
      setImagen(null);
      setPreviewImage(null);
    } else {
      toast.error(res.error || "No se pudo enviar tu testimonio");
    }
  };

  // Dividir testimonios en grupos de 3
  const slides = Array.from({ length: Math.ceil(testimonios.length / 3) }).map(
    (_, i) => testimonios.slice(i * 3, i * 3 + 3)
  );

  return (
    <section className="testimonios-section" style={{ backgroundColor: "#fdd835", padding: "3rem 0" }}>
      <div className="container text-center">
        <h2 className="mb-4 fw-bold">Testimonios de Clientes</h2>
        <p className="mb-4 text-muted">
          Lee lo que nuestros clientes opinan sobre nosotros o deja tu propio testimonio.
        </p>

        <MuiButton
          variant="contained"
          color="success"
          onClick={handleOpenForm}
          className="mb-5 fw-bold"
        >
          Deja tu testimonio
        </MuiButton>

        {/* CAROUSEL */}
        <div id="carouselTestimonios" className="carousel slide" data-bs-ride="carousel" data-bs-interval="4000">
          <div className="carousel-inner">
            {slides.map((group, idx) => (
              <div key={idx} className={`carousel-item ${idx === 0 ? "active" : ""}`}>
                <div className="row justify-content-center">
                  {group.map((t, i) => (
                    <div key={i} className="col-12 col-md-4 mb-3">
                      <div className="card shadow-lg border-0 h-100 p-3 d-flex flex-column align-items-center testimonio-card">
                        <Avatar src={t.imagen} alt={t.nombre} sx={{ width: 80, height: 80, mb: 2 }} />
                        <h5 className="fw-bold">{t.titulo}</h5>
                        <p className="fst-italic text-center">"{t.texto}"</p>
                        <Rating value={t.rating} readOnly precision={0.5} />
                        <MuiButton
                          variant="outlined"
                          size="small"
                          className="mt-3"
                          onClick={() => handleOpenDetail(idx * 3 + i)}
                        >
                          Ver más
                        </MuiButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Flechas personalizadas */}
          <button className="carousel-control-prev" type="button" data-bs-target="#carouselTestimonios" data-bs-slide="prev">
            <svg width="30" height="30" viewBox="0 0 16 16" fill="#ff6600">
              <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
            </svg>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#carouselTestimonios" data-bs-slide="next">
            <svg width="30" height="30" viewBox="0 0 16 16" fill="#ff6600">
              <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>

        {/* MODAL DETALLE */}
        {selected !== null && (
          <Dialog
            open={openDetail}
            onClose={handleCloseDetail}
            PaperComponent={PaperComponent}
            aria-labelledby="draggable-dialog-title"
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle style={{ cursor: "move", backgroundColor: "#f5f5f5" }} id="draggable-dialog-title">
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar src={testimonios[selected].imagen} sx={{ width: 50, height: 50 }} />
                <span>{testimonios[selected].nombre}</span>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body1" gutterBottom>
                {testimonios[selected].detalle}
              </Typography>
              <Box mt={2}>
                <Typography variant="subtitle1">Valoración:</Typography>
                <Rating value={testimonios[selected].rating} readOnly precision={0.5} />
              </Box>
            </DialogContent>
            <DialogActions>
              <MuiButton onClick={handleCloseDetail} variant="contained" color="primary">
                Cerrar
              </MuiButton>
            </DialogActions>
          </Dialog>
        )}

        {/* MODAL FORMULARIO */}
        <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Deja tu testimonio</DialogTitle>
          <DialogContent dividers>
            <form onSubmit={handleSubmitTestimonio}>
              {previewImage && (
                <Box display="flex" justifyContent="center" mb={2}>
                  <Avatar src={previewImage} sx={{ width: 80, height: 80 }} />
                </Box>
              )}

              <MuiButton variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
                Subir foto
                <input type="file" accept="image/*" hidden onChange={(e) => handleImageChange(e.target.files[0])} />
              </MuiButton>

              <TextField
                select
                fullWidth
                label="Título de tu experiencia"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                SelectProps={{ native: true }}
                margin="normal"
              >
                <option value=""></option>
                <option value="Excelente experiencia">Excelente experiencia</option>
                <option value="Buena experiencia">Buena experiencia</option>
                <option value="Regular experiencia">Regular experiencia</option>
                <option value="Mala experiencia">Mala experiencia</option>
              </TextField>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Tu experiencia"
                variant="outlined"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                margin="normal"
              />

              <Box mt={2}>
                <Typography>Valoración:</Typography>
                <Rating value={rating} onChange={(e, newVal) => setRating(newVal)} precision={0.5} />
              </Box>

              <DialogActions>
                <MuiButton onClick={() => setShowForm(false)}>Cancelar</MuiButton>
                <MuiButton type="submit" variant="contained" color="success">
                  Enviar
                </MuiButton>
              </DialogActions>
            </form>
          </DialogContent>
        </Dialog>

        <AuthModal show={showLogin} onClose={() => setShowLogin(false)} />
      </div>
    </section>
  );
}
