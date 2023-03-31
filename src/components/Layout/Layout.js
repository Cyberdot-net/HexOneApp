import { Toaster } from "react-hot-toast";
import Navbar from "components/Layout/Navbar";
import Footer from "components/Layout/Footer";
import Loading from "components/Common/Loading";
import ConnectWallet from "components/Modals/ConnectWallet";

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <ConnectWallet />
      <Loading />
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
          style: {
            position: "relative",
            top: "4rem",
            padding: ".7rem 1.2rem",
            color: "white",
            fontSize: "0.8rem",
            borderRadius: "20px",
            border: "2px solid #10172a",
            maxWidth: "500px",
            boxShadow:
              "0px 0px 0px 1.6px #1A2238, -4px -4px 8px rgba(255, 255, 255, 0.1), 4px 8px 8px rgba(1, 7, 19, 0.2)",
            background: "linear-gradient(135deg, #35405b 0%, #222c45 100%)",
          },
        }}
      />  
    </>
  );
};

export default Layout;
