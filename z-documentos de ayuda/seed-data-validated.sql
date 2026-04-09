/**
 * SEED DATA - VALIDADO CONTRA SCHEMA REAL
 * S7-Backend-Sis-Prestamos-y-Multas/db/schema.sql
 * 
 * ESTRUCTURA CORRECTA:
 * - loan_books: (id_book, title, type_id_reader, id_reader, name_reader, loan_days, state, date_limit, date_return)
 *   → SIN loan_id (SERIAL auto-generado)
 *   → INCLUIR loan_days (INTEGER, valores: 7, 14, 21)
 * 
 * - debt_reader: (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
 *   → SIN id_debt (SERIAL auto-generado)
 *   → INCLUIR units_fib (INTEGER = amount_debt ÷ 2.00)
 *   → loan_id resuelto dinámicamente via INSERT...SELECT + JOIN
 * 
 * ============================================================================
 */

-- ============================================================================
-- SECCIÓN 1: LIBROS - DATOS ESPECÍFICOS PARA TESTS + DATOS ADICIONALES
-- 
-- IMPORTANTE: Estos libros están en orden específico para que los tests
-- encuentren los IDs que le sucede generar (B-0001, B-1001, B-1101, etc.)
-- ============================================================================

INSERT INTO loan_books 
(id_book, title, type_id_reader, id_reader, name_reader, loan_days, state, date_limit, date_return)
VALUES
-- Libros requeridos por tests (orden específico)
('B-0001', 'Don Quijote', 'CI', 'R-1001', 'Ana García López', 7, 'RETURNED', '2026-03-28', '2026-03-25'),
('B-0002', 'Cien Años de Soledad', 'DNI', 'R-1002', 'Carlos Mendez', 7, 'RETURNED', '2026-03-23', '2026-03-20'),
('B-0003', 'La Vorágine', 'CC', 'R-1003', 'María Rodríguez', 7, 'RETURNED', '2026-03-15', '2026-03-10'),
('B-0004', 'Rayuela', 'TI', 'R-1004', 'Juan Torres', 14, 'RETURNED', '2026-02-28', '2026-02-25'),
('B-0005', 'El Principito', 'CI', 'R-1005', 'Laura Fernández', 7, 'RETURNED', '2026-03-31', '2026-03-30'),
('B-0006', 'La Casa de los Espíritus', 'DNI', 'R-1006', 'Diego Martínez', 7, 'RETURNED', '2026-03-18', '2026-03-15'),
('B-0007', 'Ficciones', 'CC', 'R-1007', 'Sofia Díaz', 7, 'RETURNED', '2026-03-20', '2026-03-18'),
('B-0008', '1984', 'TI', 'R-1008', 'Roberto Silva', 7, 'RETURNED', '2026-02-21', '2026-02-19'),
('B-0009', 'Orgullo y Prejuicio', 'CI', 'R-1009', 'Patricia Gómez', 7, 'RETURNED', '2026-03-25', '2026-03-23'),
('B-0010', 'El Quijote Ed2', 'DNI', 'R-1010', 'Fernando López', 7, 'RETURNED', '2026-03-22', '2026-03-21'),

-- === LIBROS ESPECÍFICOS REQUERIDOS POR K6-TESTS ===
-- TC-HU02-01: Registrar préstamo exitoso
('B-1001', 'Cien años de soledad (disponible)', 'CI', 'R-2001', 'Test Reader 2001', 14, 'RETURNED', '2026-03-10', '2026-03-08'),
-- TC-HU03-01: Devolución antes del plazo (date_limit=2026-04-10, loan_days=7)
('B-1101', 'Libro test devolución normal', 'DNI', 'R-2101', 'Test Reader 2101', 7, 'ON_LOAN', '2026-04-10', NULL),
-- TC-HU04-01: Devolución tardía 1 día (date_limit=2026-04-10)
('B-1201', 'Libro test mora 1 dia', 'CC', 'R-2201', 'Test Reader 2201', 7, 'ON_LOAN', '2026-04-10', NULL),
-- TC-HU04-05: Devolución tardía 22 días (date_limit=2026-04-10)
('B-1205', 'Libro test mora 22 dias', 'TI', 'R-2205', 'Test Reader 2205', 7, 'ON_LOAN', '2026-04-10', NULL),

-- PRÉSTAMOS VENCIDOS para TC-HU05-01 (Consultar préstamos vencidos)
('B-2001', 'Libro vencido 1', 'CI', 'R-2300', 'Test Reader 2300', 7, 'ON_LOAN', '2026-04-01', NULL),
('B-2002', 'Libro vencido 2', 'DNI', 'R-2301', 'Test Reader 2301', 7, 'ON_LOAN', '2026-03-31', NULL),

-- === RELLENO (más libros hasta ~100) ===
('B-0011', 'La Odisea', 'CI', 'R-1011', 'Martina Ruiz', 14, 'ON_LOAN', '2026-03-20', NULL),
('B-0012', 'La Ilíada', 'DNI', 'R-1012', 'Lucas Campos', 14, 'ON_LOAN', '2026-03-25', NULL),
('B-0013', 'Crimen y Castigo', 'CC', 'R-1013', 'Gabriela Pérez', 21, 'ON_LOAN', '2026-03-15', NULL),
('B-0014', 'Los Hermanos Karamázov', 'TI', 'R-1014', 'Andrés Núñez', 7, 'ON_LOAN', '2026-03-30', NULL),
('B-0015', 'Madame Bovary', 'CI', 'R-1015', 'Valentina Castro', 7, 'ON_LOAN', '2026-03-18', NULL),
('B-0016', 'Jane Eyre', 'DNI', 'R-1016', 'Oscar Sánchez', 14, 'ON_LOAN', '2026-03-22', NULL),
('B-0017', 'Mujercitas', 'CC', 'R-1017', 'Elena Vargas', 7, 'ON_LOAN', '2026-03-28', NULL),
('B-0018', 'Drácula', 'TI', 'R-1018', 'Marco Herrera', 14, 'ON_LOAN', '2026-03-19', NULL),
('B-0019', 'Frankenstein', 'CI', 'R-1019', 'Claudia Moreno', 7, 'ON_LOAN', '2026-03-24', NULL),
('B-0020', 'El Conde de Montecristo', 'DNI', 'R-1020', 'Ricardo Flores', 21, 'ON_LOAN', '2026-03-17', NULL),
('B-0021', 'El Extranjero', 'CC', 'R-1003', 'María Rodríguez', 7, 'RETURNED', '2026-03-10', '2026-03-18'),
('B-0022', 'La Peste', 'CI', 'R-1001', 'Ana García López', 14, 'RETURNED', '2026-03-15', '2026-03-30'),
('B-0023', 'El Segundo Sexo', 'DNI', 'R-1002', 'Carlos Mendez', 7, 'RETURNED', '2026-02-21', '2026-03-10'),
('B-0024', 'El Ser y la Nada', 'TI', 'R-1004', 'Juan Torres', 7, 'RETURNED', '2026-02-14', '2026-03-08'),
('B-0025', 'Crítica de la Razón Pura', 'CC', 'R-1007', 'Sofia Díaz', 7, 'RETURNED', '2026-03-01', '2026-03-22'),
('B-0026', 'Metamorfosis', 'CI', 'R-1005', 'Laura Fernández', 7, 'RETURNED', '2026-03-29', '2026-03-28'),
('B-0027', 'El Proceso', 'DNI', 'R-1006', 'Diego Martínez', 7, 'RETURNED', '2026-03-19', '2026-03-18'),
('B-0028', 'El Castillo', 'CC', 'R-1008', 'Roberto Silva', 7, 'RETURNED', '2026-03-26', '2026-03-24'),
('B-0029', 'Belgrado', 'TI', 'R-1009', 'Patricia Gómez', 7, 'RETURNED', '2026-03-27', '2026-03-26'),
('B-0030', 'El Hombre sin Atributos', 'CI', 'R-1010', 'Fernando López', 7, 'RETURNED', '2026-03-12', '2026-03-10'),
('B-0031', 'Memorias de Adriano', 'DNI', 'R-1021', 'Beatriz Álvarez', 14, 'ON_LOAN', '2026-03-18', NULL),
('B-0032', 'Los Miserables', 'CC', 'R-1022', 'Guillermo Torres', 14, 'ON_LOAN', '2026-03-20', NULL),
('B-0033', 'Moby Dick', 'TI', 'R-1023', 'Iris Ramírez', 14, 'ON_LOAN', '2026-03-25', NULL),
('B-0034', 'Jane Austen Orgullo', 'CI', 'R-1024', 'Javier López', 7, 'ON_LOAN', '2026-03-22', NULL),
('B-0035', 'Las Desventura', 'DNI', 'R-1011', 'Martina Ruiz', 7, 'RETURNED', '2026-03-14', '2026-03-12'),
('B-0036', 'Tragedias Griegas', 'CC', 'R-1012', 'Lucas Campos', 7, 'RETURNED', '2026-03-21', '2026-03-20'),
('B-0037', 'Poesía Lírica Medieval', 'TI', 'R-1013', 'Gabriela Pérez', 7, 'RETURNED', '2026-03-08', '2026-03-05'),
('B-0038', 'Leyendas Germánicas', 'CI', 'R-1014', 'Andrés Núñez', 7, 'RETURNED', '2026-03-23', '2026-03-22'),
('B-0039', 'Mitología Nórdica', 'DNI', 'R-1015', 'Valentina Castro', 7, 'RETURNED', '2026-03-16', '2026-03-14'),
('B-0040', 'Épicos Celtas', 'CC', 'R-1016', 'Oscar Sánchez', 7, 'RETURNED', '2026-03-24', '2026-03-23'),
('B-0041', 'Filosofía Moderna', 'TI', 'R-1025', 'Nicolás Mendoza', 7, 'ON_LOAN', '2026-03-19', NULL),
('B-0042', 'Historia Universal', 'CI', 'R-1026', 'Xenia Ruiz', 14, 'ON_LOAN', '2026-03-23', NULL),
('B-0043', 'Astronomía e Cosmos', 'DNI', 'R-1027', 'Yolanda García', 14, 'ON_LOAN', '2026-03-21', NULL),
('B-0044', 'Física Cuántica', 'CC', 'R-1028', 'Zacarías López', 7, 'ON_LOAN', '2026-03-20', NULL),
('B-0045', 'Biología Molecular', 'TI', 'R-1017', 'Elena Vargas', 7, 'RETURNED', '2026-03-06', '2026-03-04'),
('B-0046', 'Química Orgánica', 'CI', 'R-1018', 'Marco Herrera', 7, 'RETURNED', '2026-03-13', '2026-03-11'),
('B-0047', 'Geometría Euclidiana', 'DNI', 'R-1019', 'Claudia Moreno', 7, 'RETURNED', '2026-03-27', '2026-03-26'),
('B-0048', 'Álgebra Lineal', 'CC', 'R-1020', 'Ricardo Flores', 7, 'RETURNED', '2026-03-17', '2026-03-15'),
('B-0049', 'Cálculo Diferencial', 'TI', 'R-1021', 'Beatriz Álvarez', 7, 'RETURNED', '2026-03-25', '2026-03-24'),
('B-0050', 'Estadística Aplicada', 'CI', 'R-1022', 'Guillermo Torres', 7, 'RETURNED', '2026-03-19', '2026-03-17'),
('B-0051', 'El Viaje a Utopía', 'DNI', 'R-1029', 'Alejandra Núñez', 7, 'ON_LOAN', '2026-03-16', NULL),
('B-0052', 'Los Viajes de Gulliver', 'CC', 'R-1030', 'Silvio Pérez', 14, 'ON_LOAN', '2026-03-24', NULL),
('B-0053', 'Robinson Crusoe', 'TI', 'R-1023', 'Iris Ramírez', 7, 'RETURNED', '2026-03-09', '2026-03-07'),
('B-0054', 'Ivanhoe', 'CI', 'R-1024', 'Javier López', 7, 'RETURNED', '2026-03-28', '2026-03-27'),
('B-0055', 'Waverly', 'DNI', 'R-1025', 'Nicolás Mendoza', 7, 'RETURNED', '2026-03-11', '2026-03-09'),
('B-0056', 'Señor de las Moscas', 'CC', 'R-1026', 'Xenia Ruiz', 7, 'RETURNED', '2026-03-30', '2026-03-29'),
('B-0057', 'Atrapa si Puedes', 'TI', 'R-1027', 'Yolanda García', 7, 'RETURNED', '2026-03-14', '2026-03-12'),
('B-0058', 'El Guardián Centeno', 'CI', 'R-1028', 'Zacarías López', 7, 'RETURNED', '2026-03-22', '2026-03-20'),
('B-0059', 'La Brújula Dorada', 'DNI', 'R-1029', 'Alejandra Núñez', 7, 'RETURNED', '2026-03-15', '2026-03-13'),
('B-0060', 'Su Materia Oscura', 'CC', 'R-1030', 'Silvio Pérez', 7, 'RETURNED', '2026-03-26', '2026-03-24'),
('B-0061', 'El Nombre del Viento', 'TI', 'R-1001', 'Ana García López', 7, 'ON_LOAN', '2026-03-29', NULL),
('B-0062', 'El Temor de Un Rey', 'CI', 'R-1002', 'Carlos Mendez', 14, 'ON_LOAN', '2026-03-27', NULL),
('B-0063', 'Mistborn Era 1', 'DNI', 'R-1003', 'María Rodríguez', 7, 'ON_LOAN', '2026-03-28', NULL),
('B-0064', 'El Imperio Final', 'CC', 'R-1031', 'Mónica Herrera', 7, 'RETURNED', '2026-03-10', '2026-03-08'),
('B-0065', 'Las Brumas', 'TI', 'R-1032', 'Tomás Ruiz', 7, 'RETURNED', '2026-03-20', '2026-03-18'),
('B-0066', 'La Decadencia Futura', 'CI', 'R-1033', 'Vanessa Díaz', 7, 'RETURNED', '2026-03-05', '2026-03-03'),
('B-0067', 'Novela Gótica I', 'DNI', 'R-1034', 'Walter García', 7, 'RETURNED', '2026-03-25', '2026-03-24'),
('B-0068', 'Novela Gótica II', 'CC', 'R-1035', 'Úrsula López', 7, 'RETURNED', '2026-03-18', '2026-03-16'),
('B-0069', 'Novela Gótica III', 'TI', 'R-1036', 'Vicente Torres', 7, 'RETURNED', '2026-03-12', '2026-03-10'),
('B-0070', 'Las Entrañas Oscuras', 'CI', 'R-1037', 'Whitney Campos', 7, 'RETURNED', '2026-03-28', '2026-03-26'),
('B-0071', 'Fantasía Épica I', 'DNI', 'R-1004', 'Juan Torres', 7, 'ON_LOAN', '2026-03-26', NULL),
('B-0072', 'Fantasía Épica II', 'CC', 'R-1005', 'Laura Fernández', 14, 'ON_LOAN', '2026-03-23', NULL),
('B-0073', 'Fantasía Épica III', 'TI', 'R-1006', 'Diego Martínez', 21, 'ON_LOAN', '2026-03-21', NULL),
('B-0074', 'Ciencia Ficción Clásica', 'CI', 'R-1038', 'Xiomara Rodríguez', 7, 'RETURNED', '2026-03-07', '2026-03-05'),
('B-0075', 'Distopía Futura', 'DNI', 'R-1039', 'Yunior Martínez', 7, 'RETURNED', '2026-03-24', '2026-03-22'),
('B-0076', 'Historias Alternativas', 'CC', 'R-1040', 'Zulema Pérez', 7, 'RETURNED', '2026-03-16', '2026-03-14'),
('B-0077', 'Aventura Submarina', 'TI', 'R-1041', 'Arlene Vargas', 7, 'RETURNED', '2026-03-19', '2026-03-17'),
('B-0078', 'Viaje Espacial', 'CI', 'R-1042', 'Braulio Silva', 7, 'RETURNED', '2026-03-11', '2026-03-09'),
('B-0079', 'Mundos Paralelos', 'DNI', 'R-1043', 'Celina Flores', 7, 'RETURNED', '2026-03-27', '2026-03-25'),
('B-0080', 'Máquinas Inteligentes', 'CC', 'R-1044', 'Danilo Sánchez', 7, 'RETURNED', '2026-03-13', '2026-03-11'),
('B-0081', 'Misterio Detective I', 'TI', 'R-1007', 'Sofia Díaz', 7, 'ON_LOAN', '2026-03-22', NULL),
('B-0082', 'Misterio Detective II', 'CI', 'R-1008', 'Roberto Silva', 21, 'ON_LOAN', '2026-03-24', NULL),
('B-0083', 'Crimen Psicológico', 'DNI', 'R-1045', 'Evaldo Herrera', 7, 'RETURNED', '2026-03-06', '2026-03-04'),
('B-0084', 'Suspenso Oscuro', 'CC', 'R-1046', 'Fátima Moreno', 7, 'RETURNED', '2026-03-28', '2026-03-27'),
('B-0085', 'Thriller Psicológico', 'TI', 'R-1047', 'Gustavo Núñez', 7, 'RETURNED', '2026-03-10', '2026-03-08'),
('B-0086', 'Novela Negra Urbana', 'CI', 'R-1048', 'Hortensia Rodríguez', 7, 'RETURNED', '2026-03-25', '2026-03-23'),
('B-0087', 'Crimen Corporativo', 'DNI', 'R-1049', 'Ignacio López', 7, 'RETURNED', '2026-03-17', '2026-03-15'),
('B-0088', 'Espionaje Internacional', 'CC', 'R-1050', 'Josefa Flores', 7, 'RETURNED', '2026-03-31', '2026-03-30'),
('B-0089', 'Conspiración Global', 'TI', 'R-1009', 'Patricia Gómez', 7, 'RETURNED', '2026-03-14', '2026-03-12'),
('B-0090', 'Misterio del Pasado', 'CI', 'R-1010', 'Fernando López', 7, 'RETURNED', '2026-03-21', '2026-03-19'),
('B-0091', 'Romance Contemporáneo', 'DNI', 'R-1011', 'Martina Ruiz', 14, 'ON_LOAN', '2026-03-23', NULL),
('B-0092', 'Amor Imposible', 'CC', 'R-1012', 'Lucas Campos', 7, 'ON_LOAN', '2026-03-26', NULL),
('B-0093', 'Pasión Juvenil', 'TI', 'R-1051', 'Karen Díaz', 7, 'RETURNED', '2026-03-08', '2026-03-06'),
('B-0094', 'Primer Amor', 'CI', 'R-1052', 'Leonel García', 7, 'RETURNED', '2026-03-22', '2026-03-20'),
('B-0095', 'Historias de Familia', 'DNI', 'R-1053', 'Maritza Herrera', 7, 'RETURNED', '2026-03-15', '2026-03-13'),
('B-0096', 'Memorias del Corazón', 'CC', 'R-1054', 'Néstor Torres', 7, 'RETURNED', '2026-03-29', '2026-03-28'),
('B-0097', 'Cartas de Amor', 'TI', 'R-1055', 'Olivia Pérez', 7, 'RETURNED', '2026-03-11', '2026-03-09'),
('B-0098', 'Destino Entrelazado', 'CI', 'R-1013', 'Gabriela Pérez', 7, 'RETURNED', '2026-03-24', '2026-03-22'),
('B-0099', 'Encuentro del Alma', 'DNI', 'R-1014', 'Andrés Núñez', 7, 'RETURNED', '2026-03-18', '2026-03-16'),
('B-0100', 'Amor Eterno', 'CC', 'R-1015', 'Valentina Castro', 7, 'RETURNED', '2026-03-27', '2026-03-26');

-- ============================================================================
-- SECCIÓN 2: 25 DEUDAS (20 PENDING + 5 PAID)
-- 
-- Resolución dinámica de loan_id via INSERT...SELECT + JOIN
-- ============================================================================

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'CI', 'R-1011', 'Martina Ruiz', 4, 8.00, 'PENDING'
FROM loan_books lb WHERE lb.id_book = 'B-0011' AND lb.id_reader = 'R-1011' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'DNI', 'R-1012', 'Lucas Campos', 2, 4.00, 'PENDING'
FROM loan_books lb WHERE lb.id_book = 'B-0012' AND lb.id_reader = 'R-1012' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'CC', 'R-1013', 'Gabriela Pérez', 7, 14.00, 'PENDING'
FROM loan_books lb WHERE lb.id_book = 'B-0013' AND lb.id_reader = 'R-1013' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'TI', 'R-1014', 'Andrés Núñez', 1, 2.00, 'PENDING'
FROM loan_books lb WHERE lb.id_book = 'B-0014' AND lb.id_reader = 'R-1014' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'CI', 'R-1015', 'Valentina Castro', 2, 4.00, 'PENDING'
FROM loan_books lb WHERE lb.id_book = 'B-0015' AND lb.id_reader = 'R-1015' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'DNI', 'R-1016', 'Oscar Sánchez', 2, 4.00, 'PENDING'
FROM loan_books lb WHERE lb.id_book = 'B-0016' AND lb.id_reader = 'R-1016' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'CC', 'R-1017', 'Elena Vargas', 1, 2.00, 'PENDING'
FROM loan_books lb WHERE lb.id_book = 'B-0017' AND lb.id_reader = 'R-1017' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'TI', 'R-1018', 'Marco Herrera', 4, 8.00, 'PENDING'
FROM loan_books lb WHERE lb.id_book = 'B-0018' AND lb.id_reader = 'R-1018' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'CI', 'R-1019', 'Claudia Moreno', 2, 4.00, 'PENDING'
FROM loan_books lb WHERE lb.id_book = 'B-0019' AND lb.id_reader = 'R-1019' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'DNI', 'R-1020', 'Ricardo Flores', 1, 2.00, 'PENDING'
FROM loan_books lb WHERE lb.id_book = 'B-0020' AND lb.id_reader = 'R-1020' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'DNI', 'R-1021', 'Beatriz Álvarez', 2, 4.00, 'PENDING'
FROM loan_books lb WHERE lb.id_book = 'B-0031' AND lb.id_reader = 'R-1021' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'CC', 'R-1022', 'Guillermo Torres', 4, 8.00, 'PENDING'
FROM loan_books lb WHERE lb.id_book = 'B-0032' AND lb.id_reader = 'R-1022' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'TI', 'R-1023', 'Iris Ramírez', 2, 4.00, 'PENDING'
FROM loan_books lb WHERE lb.id_book = 'B-0033' AND lb.id_reader = 'R-1023' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'CI', 'R-1024', 'Javier López', 2, 4.00, 'PENDING'
FROM loan_books lb WHERE lb.id_book = 'B-0034' AND lb.id_reader = 'R-1024' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'TI', 'R-1025', 'Nicolás Mendoza', 1, 2.00, 'PENDING'
FROM loan_books lb WHERE lb.id_book = 'B-0041' AND lb.id_reader = 'R-1025' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'CI', 'R-1026', 'Xenia Ruiz', 2, 4.00, 'PENDING'
FROM loan_books lb WHERE lb.id_book = 'B-0042' AND lb.id_reader = 'R-1026' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'DNI', 'R-1027', 'Yolanda García', 4, 8.00, 'PENDING'
FROM loan_books lb WHERE lb.id_book = 'B-0043' AND lb.id_reader = 'R-1027' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'CC', 'R-1028', 'Zacarías López', 2, 4.00, 'PENDING'
FROM loan_books lb WHERE lb.id_book = 'B-0044' AND lb.id_reader = 'R-1028' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'DNI', 'R-1029', 'Alejandra Núñez', 1, 2.00, 'PENDING'
FROM loan_books lb WHERE lb.id_book = 'B-0051' AND lb.id_reader = 'R-1029' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'CC', 'R-1030', 'Silvio Pérez', 2, 4.00, 'PENDING'
FROM loan_books lb WHERE lb.id_book = 'B-0052' AND lb.id_reader = 'R-1030' LIMIT 1;

-- === DEUDAS ESPECÍFICAS REQUERIDAS POR K6-TESTS ===
-- TC-HU06-01: Registrar pago de deuda
INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'CC', 'R-2201', 'Test Reader 2201', 1, 2.00, 'PENDING'
FROM loan_books lb WHERE lb.id_book = 'B-1201' AND lb.id_reader = 'R-2201' LIMIT 1;

-- Deudas PAID (histórico de lectores rehabilitados)
INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'CC', 'R-1003', 'María Rodríguez', 2, 4.00, 'PAID'
FROM loan_books lb WHERE lb.id_book = 'B-0021' AND lb.id_reader = 'R-1003' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'CI', 'R-1001', 'Ana García López', 4, 8.00, 'PAID'
FROM loan_books lb WHERE lb.id_book = 'B-0022' AND lb.id_reader = 'R-1001' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'DNI', 'R-1002', 'Carlos Mendez', 2, 4.00, 'PAID'
FROM loan_books lb WHERE lb.id_book = 'B-0023' AND lb.id_reader = 'R-1002' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'TI', 'R-1004', 'Juan Torres', 7, 14.00, 'PAID'
FROM loan_books lb WHERE lb.id_book = 'B-0024' AND lb.id_reader = 'R-1004' LIMIT 1;

INSERT INTO debt_reader (loan_id, type_id_reader, id_reader, name_reader, units_fib, amount_debt, state_debt)
SELECT lb.loan_id, 'CC', 'R-1007', 'Sofia Díaz', 4, 8.00, 'PAID'
FROM loan_books lb WHERE lb.id_book = 'B-0025' AND lb.id_reader = 'R-1007' LIMIT 1;

--Validación completada ✓
