/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Category, Condition, Seller } from "./types";

export const SELLERS: Record<string, Seller> = {
  
  sofia: {
    id: "sofia",
    name: "Sofía Gómez",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    role: "Estudiante de Medicina, 4to año",
    rating: 4.8,
    salesCount: 14,
    persona: "Eres Sofía Gómez, estudiante de Medicina de 4to año. Estás vendiendo tus apuntes o libros médicos porque ya pasaste esas materias y necesitas espacio. Eres muy amable, detallista y comprensiva, pero valoras tu esfuerzo al transcribir y dibujar en tus apuntes. Puedes aceptar ofertas con hasta un 25% de descuento si el estudiante te explica de manera simpática que está corto de presupuesto. Si te ofrecen menos del 25% de descuento, dirás educadamente que no puedes porque te tomó semanas hacerlos.",
  },
  hector: {
    id: "hector",
    name: "Dr. Héctor Valenzuela",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    role: "Profesor de Cálculo (Jubilado)",
    rating: 4.9,
    salesCount: 3,
    persona: "Eres el Dr. Héctor Valenzuela, profesor jubilado de Ingeniería y Cálculo. Eres extremadamente formal, hablas de 'Usted' y valoras mucho la ortografía, la seriedad académica y la puntualidad. Estás vendiendo libros clásicos de tu biblioteca personal. No te gustan los regateos informales ni las ofertas absurdas. Tu precio ya es justo. Como máximo aceptarás un 10% de descuento si el estudiante se muestra muy respetuoso e interesado genuinamente en aprender la materia. Si te ofrecen una rebaja ridícula, te ofenderás un poco y sugerirás que estudien más en lugar de buscar atajos.",
  },
  lucas: {
    id: "lucas",
    name: "Lucas Rivas",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    role: "Estudiante de Ing. de Sistemas, 5to año",
    rating: 4.5,
    salesCount: 22,
    persona: "Eres Lucas Rivas, estudiante nerd de Ingeniería de Sistemas de último año. Eres un poco caótico, gracioso, usas mucha jerga informática (bugs, deploy, git, stack, etc.) y estás muy desesperado por conseguir dinero rápido para pagar el servidor de tu startup y comprar café. Estás vendiendo gadgets viejos y libros de algoritmos. Estás muy dispuesto a negociar: aceptarás ofertas de hasta un 40% de descuento si la transacción se hace rápido hoy mismo. Si te ofrecen menos de eso, bromearás diciendo que eso no paga ni un latte de Starbucks.",
  },
  camila: {
    id: "camila",
    name: "Camila Torres",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    role: "Estudiante de primer año (Artes)",
    rating: 4.7,
    salesCount: 5,
    persona: "Eres Camila Torres, estudiante despistada pero super entusiasta de primer año de Artes Visuales. Eres muy amigable, hablas con emojis, exclamaciones y eres muy maleable. No tienes mucha experiencia vendiendo cosas, así que te dejas convencer fácilmente si te tratan con cariño. Estás vendiendo materiales de arte o libros introductorios. Aceptas descuentos de hasta un 35% sin mucho problema. Siempre pides consejos sobre la universidad, qué tal son los profesores y te gusta conversar.",
  },
};

export const INITIAL_PRODUCTS: Product[] = [


  {
    id: "p9",
    title: "caramelo (Edición Universitaria)",
    description: "caramelo para laboratorio",
    price: 1.10,
    category: Category.LAB_EQUIPMENT,
    condition: Condition.LIKE_NEW,
    image: "/src/assets/images/stitch_plush_1783649171605.jpg",
    seller: SELLERS.lucas,
    createdAt: "2026-07-21",
  },
  {
    id: "stitch_plush",
    title: "Peluche de Stitch Coleccionista (Edición Universitaria)",
    description: "Hermoso peluche gigante de Stitch (Disney) de mi colección personal. Está impecable, supersuave y siempre me acompañó durante mis maratones de estudio para los parciales de Ingeniería. Ideal para regalar o decorar tu escritorio de estudio en la UNSCH.",
    price: 25.0,
    category: Category.LAB_EQUIPMENT,
    condition: Condition.LIKE_NEW,
    image: "/src/assets/images/stitch_plush_1783649171605.jpg",
    seller: SELLERS.camila,
    createdAt: "2026-07-09",
  },
  {
    id: "stitch_backpack",
    title: "Mochila Ergonómica de Stitch para Campus",
    description: "Mochila escolar espaciosa con estampado de Stitch. Tiene compartimento acolchado para laptop de hasta 15.6 pulgadas, bolsillos laterales para botellas de agua y correas ultra ergonómicas para soportar el peso de los libros de cálculo. Excelente estado de conservación, cremalleras perfectas.",
    price: 32.0,
    category: Category.LAB_EQUIPMENT,
    condition: Condition.GOOD,
    image: "/src/assets/images/stitch_backpack_1783649183900.jpg",
    seller: SELLERS.lucas,
    createdAt: "2026-07-09",
  },
  {
    id: "stitch_mug",
    title: "Taza de Cerámica 3D de Stitch para Café",
    description: "Taza de cerámica de Stitch pintada a mano con relieve 3D. Capacidad de 15oz, perfecta para esas largas noches de café cargado antes de los exámenes finales. Mantiene el calor de maravilla. Se entrega lavada y desinfectada en el campus.",
    price: 12.0,
    category: Category.LAB_EQUIPMENT,
    condition: Condition.NEW,
    image: "/src/assets/images/stitch_mug_1783649200664.jpg",
    seller: SELLERS.sofia,
    createdAt: "2026-07-09",
  },
  {
    id: "p1",
    title: "Cálculo: Trascendentes Tempranas (James Stewart)",
    description: "El libro definitivo para Cálculo I, II y III. Séptima edición en español. Tiene algunas páginas subrayadas con lápiz pero la estructura y las hojas están en perfecto estado. No le falta ninguna página. Esencial para estudiantes de Ingeniería y Ciencias.",
    price: 45.0,
    category: Category.TEXTBOOKS,
    condition: Condition.GOOD,
    courseCode: "MAT-101",
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=80",
    seller: SELLERS.hector,
    createdAt: "2026-07-01",
  },
  {
    id: "p2",
    title: "Apuntes Ilustrados de Anatomía Humana: Cabeza y Cuello",
    description: "Apuntes manuscritos a todo color con esquemas detallados de irrigación, inervación y músculos de cabeza y cuello. Incluye mnemotecnias clave para los exámenes prácticos de anatomía. Digitalizados e impresos en papel de alta calidad argollado.",
    price: 15.0,
    category: Category.NOTES,
    condition: Condition.LIKE_NEW,
    courseCode: "MED-201",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500&auto=format&fit=crop&q=80",
    seller: SELLERS.sofia,
    createdAt: "2026-07-05",
  },
  {
    id: "p3",
    title: "Calculadora Gráfica TI-84 Plus CE (Color)",
    description: "Calculadora gráfica a color de Texas Instruments. Ideal para álgebra lineal, cálculo multivariable, física y estadística. Se entrega con su cargador USB original y estuche protector rígido. La batería le dura semanas. Tiene un par de rayones menores de uso.",
    price: 95.0,
    category: Category.TECH,
    condition: Condition.GOOD,
    courseCode: "EST-202",
    image: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=500&auto=format&fit=crop&q=80",
    seller: SELLERS.lucas,
    createdAt: "2026-07-08",
  },
  {
    id: "p4",
    title: "Kit Completo de Dibujo Técnico y Maquetación",
    description: "Incluye tablero de dibujo portátil A3, juego de escuadras Rotring, escalímetro profesional, portaminas Faber-Castell (0.5, 0.7) y un compás de precisión con adaptador. Ideal para alumnos de primer año de Arquitectura e Ingeniería Civil.",
    price: 35.0,
    category: Category.LAB_EQUIPMENT,
    condition: Condition.LIKE_NEW,
    courseCode: "ARQ-102",
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&auto=format&fit=crop&q=80",
    seller: SELLERS.camila,
    createdAt: "2026-07-07",
  },
  {
    id: "p5",
    title: "Tutoría Intensiva de Algoritmos y Estructuras de Datos",
    description: "Preparación intensiva para exámenes parciales o finales de Algoritmos (árboles, grafos, complejidad Big-O, recursividad). La sesión dura 2 horas vía Meet con pizarra digital y resolución de exámenes pasados. Garantizo que apruebas.",
    price: 20.0,
    category: Category.TUTORING,
    condition: Condition.NEW,
    courseCode: "INF-203",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80",
    seller: SELLERS.lucas,
    createdAt: "2026-07-09",
  },
  {
    id: "p6",
    title: "Kit de Modelos Moleculares para Química Orgánica",
    description: "Set completo de esferas y enlaces para representar moléculas orgánicas en 3D (isómeros, proyecciones de Newman, conformaciones de silla). Vital para entender Estereoquímica. Prácticamente nuevo, incluye caja organizadora original.",
    price: 18.0,
    category: Category.LAB_EQUIPMENT,
    condition: Condition.LIKE_NEW,
    courseCode: "QUI-110",
    image: "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=500&auto=format&fit=crop&q=80",
    seller: SELLERS.sofia,
    createdAt: "2026-07-04",
  },
  {
    id: "p7",
    title: "Química Orgánica: Estructura y Función (Vollhardt)",
    description: "Quinta edición en español de Vollhardt. Uno de los libros más completos y didácticos de química orgánica. Con esquemas ilustrativos. Tapa dura, tiene un leve desgaste en las esquinas de la portada, pero las hojas interiores están impecables.",
    price: 38.0,
    category: Category.TEXTBOOKS,
    condition: Condition.GOOD,
    courseCode: "QUI-111",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&auto=format&fit=crop&q=80",
    seller: SELLERS.sofia,
    createdAt: "2026-07-02",
  },
  {
    id: "p8",
    title: "Kit de Desarrollo Arduino Uno R3 + Sensores",
    description: "Placa Arduino Uno R3, protoboard grande, cable USB, pack de 65 cables de conexión, sensor ultrasónico HC-SR04, módulo bluetooth HC-05, giroscopio, servomotor SG90 y múltiples leds y resistencias. Perfecto para cursos de Sistemas Digitales o Mecatrónica.",
    price: 30.0,
    category: Category.TECH,
    condition: Condition.GOOD,
    courseCode: "IEE-304",
    image: "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?w=500&auto=format&fit=crop&q=80",
    seller: SELLERS.lucas,
    createdAt: "2026-07-06",
  }
];

export const MOCK_USER: { 
  firstName: string;
  lastName: string;
  name: string; 
  email: string; 
  university: string; 
  avatar: string; 
  balance: number;
  dni: string;
  isDniVerified: boolean;
} = {
  firstName: "Estudiante",
  lastName: "Prueba",
  name: "Estudiante Prueba",
  email: "estudiante.prueba@unsch.edu.pe", // Correo inventado
  university: "Universidad Nacional de San Cristóbal de Huamanga",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  balance: 0.0, 
  dni: "00000000", // DNI inventado
  isDniVerified: false,
};
