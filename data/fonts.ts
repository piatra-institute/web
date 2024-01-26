import { Inter, Libre_Baskerville } from 'next/font/google';



const inter = Inter({ subsets: ['latin'] })
const libreBaskerville = Libre_Baskerville({
    weight: ['400', '700'],
    subsets: ['latin'],
});


const fonts = `${inter.className} ${libreBaskerville.className}`;


export default fonts;
