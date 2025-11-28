import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Passport from "@/pages/Passport";
import AddContribution from "@/pages/AddContribution";
import Explore from "@/pages/Explore";
import { Toaster } from "@/components/ui/sonner";

const App = () => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/passport" element={<Passport />} />
        <Route path="/contribute" element={<AddContribution />} />
        <Route path="/explore" element={<Explore />} />
      </Routes>
    </Layout>
    <Toaster />
  </BrowserRouter>
);

export default App;
