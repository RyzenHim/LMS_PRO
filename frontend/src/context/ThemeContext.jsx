import React from 'react'
import { lightTheme, darkTheme } from '../theme'
import { useContext } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { useState } from 'react'


const ThemeContextProvider = ({ children }) => {
    const [mode, setMode] = useState("light")


    return (
        <div>ThemeContext</div>
    )
}

export default ThemeContextProvider 