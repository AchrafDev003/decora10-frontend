// src/Pages/Home.jsx
import React, { useEffect } from "react";
import Hero from "../Components/Hero";
import StatsSection from "../Components/Stats";
import Main from "../Components/Main";
import Categoria from "../Components/Categoria";
import Colchoneria from "../Components/Colchoneria";
import Testimonios from "../Components/Testimonios";
import { useLocation } from "react-router-dom";

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname, location.search]);

  return (
    <>
      <Hero />
      <StatsSection />
      <Main />
      <Categoria />
      <Colchoneria />
      <Testimonios />
    </>
  );
};

export default Home;
