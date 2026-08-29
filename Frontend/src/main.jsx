import "@fontsource/inter"
import "@fontsource/playfair-display"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { GoogleOAuthProvider } from "@react-oauth/google"

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1028374659281-dummymerijodi.apps.googleusercontent.com"

createRoot(document.getElementById("root")).render(
    <GoogleOAuthProvider clientId={googleClientId}>
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </GoogleOAuthProvider>
)
