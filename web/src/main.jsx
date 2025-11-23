import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import PricingPlansPage from './pages/PricingPlansPage'
import AdminPricingPlans from './pages/AdminPricingPlans'
import './index.css'
import { ToastProvider } from './components/ToastProvider'

createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<ToastProvider>
			<BrowserRouter>
				<Routes>
					<Route path='/' element={<App />}>
						<Route index element={<PricingPlansPage />} />
						<Route path='pricing' element={<PricingPlansPage />} />
						<Route path='admin/pricing' element={<AdminPricingPlans />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</ToastProvider>
	</React.StrictMode>
)
