const fs = require('fs');
const path = require('path');

function createSimplePdf(filename, docInfo) {
  const { title, docType, patientName, hcNum, dni, date, service, doctor, diag, textLines } = docInfo;

  // Stream content commands
  let content = '';
  // Background header band
  content += '0.08 0.35 0.65 rg\n'; // Primary hospital blue
  content += '40 730 532 50 re f\n';
  
  // Header text (White)
  content += 'BT\n';
  content += '/F1 14 Tf\n';
  content += '1 1 1 rg\n'; // White text
  content += '55 756 Td\n';
  content += `(INSTITUTO NACIONAL DE SALUD DEL NINO - INSN BRENA) Tj\n`;
  content += '/F1 10 Tf\n';
  content += '0 -16 Td\n';
  content += `(HISTORIA CLINICA PEDIATRICA - EXPEDIENTE CLINICO FISICO DIGITALIZADO) Tj\n`;
  content += 'ET\n';

  // Subheader bar
  content += '0.94 0.96 0.98 rg\n';
  content += '40 645 532 75 re f\n';
  content += '0.80 0.85 0.90 RG\n';
  content += '1 w\n';
  content += '40 645 532 75 re s\n';

  // Patient Info Block
  content += 'BT\n';
  content += '0.1 0.15 0.25 rg\n';
  content += '/F2 10 Tf\n';
  content += '55 702 Td\n';
  content += `(DOCUMENTO: ${docType}) Tj\n`;
  content += '/F1 9 Tf\n';
  content += '0 -14 Td\n';
  content += `(PACIENTE: ${patientName}    |    DNI: ${dni}    |    HC: ${hcNum}) Tj\n`;
  content += '0 -14 Td\n';
  content += `(FECHA REGISTRO: ${date}    |    SERVICIO: ${service}) Tj\n`;
  content += '0 -14 Td\n';
  content += `(MEDICO TRATANTE: ${doctor}) Tj\n`;
  content += 'ET\n';

  // Line separator
  content += '0.2 0.5 0.8 RG\n';
  content += '2 w\n';
  content += '40 635 m 572 635 l S\n';

  // Diagnosis highlight box
  content += '0.99 0.95 0.90 rg\n';
  content += '40 595 532 30 re f\n';
  content += '0.90 0.60 0.20 RG\n';
  content += '1 w\n';
  content += '40 595 532 30 re s\n';

  content += 'BT\n';
  content += '0.7 0.3 0.0 rg\n';
  content += '/F2 10 Tf\n';
  content += '55 607 Td\n';
  content += `(DIAGNOSTICO CIE-10: ${diag}) Tj\n`;
  content += 'ET\n';

  // Section Body
  content += 'BT\n';
  content += '0.15 0.15 0.2 rg\n';
  content += '/F1 9 Tf\n';
  let curY = 570;
  content += `55 ${curY} Td\n`;

  for (const line of textLines) {
    if (line.startsWith('###')) {
      content += `ET\nBT\n0.08 0.35 0.65 rg\n/F2 10 Tf\n55 ${curY - 18} Td\n(${line.replace('###', '').trim()}) Tj\nET\nBT\n0.15 0.15 0.2 rg\n/F1 9 Tf\n55 ${curY - 32} Td\n`;
      curY -= 32;
    } else {
      // Escape parentheses in line
      const safe = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
      content += `(${safe}) Tj\n0 -13 Td\n`;
      curY -= 13;
    }
  }
  content += 'ET\n';

  // Footer / Stamp representation
  content += '0.85 0.88 0.92 RG\n';
  content += '0.5 w\n';
  content += '40 60 532 1 m 572 60 l S\n';

  content += 'BT\n';
  content += '0.4 0.45 0.5 rg\n';
  content += '/F1 8 Tf\n';
  content += '55 45 Td\n';
  content += '(EXPEDIENTE DIGITALIZADO - DIRECCION DE ARCHIVO CLINICO - INSN BRENA - LIMA, PERU) Tj\n';
  content += 'ET\n';

  // Build PDF structure
  const objects = [];
  function addObject(str) {
    objects.push(str);
    return objects.length;
  }

  // 1: Catalog
  addObject('<< /Type /Catalog /Pages 2 0 R >>');
  // 2: Pages
  addObject('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  // 3: Page
  addObject('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>');
  // 4: Contents
  const streamLen = Buffer.byteLength(content, 'latin1');
  addObject(`<< /Length ${streamLen} >>\nstream\n${content}\nendstream`);
  // 5: Font F1 (Helvetica)
  addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  // 6: Font F2 (Helvetica-Bold)
  addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

  // Assembly
  let pdf = '%PDF-1.4\n';
  const offsets = [];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  pdf += 'xref\n';
  pdf += `0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 0; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += 'trailer\n';
  pdf += `<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += 'startxref\n';
  pdf += `${xrefOffset}\n`;
  pdf += '%%EOF\n';

  fs.writeFileSync(filename, pdf, 'latin1');
  console.log(`Created PDF: ${filename} (${pdf.length} bytes)`);
}

const docsDir = path.join(__dirname, '..', 'public', 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// 1. Valeria Alarcon - Cirugia Pediatrica
createSimplePdf(path.join(docsDir, 'hc-2024-03120.pdf'), {
  title: 'HISTORIA CLINICA QUIRURGICA',
  docType: 'HOJA DE HOSPITALIZACION Y PARTE QUIRURGICO',
  patientName: 'ALARCON CASTILLO, VALERIA SOFIA',
  hcNum: 'HC-2024-03120',
  dni: '78451290',
  date: '12/09/2026',
  service: 'HOSPITALIZACION CIRUGIA PEDIATRICA',
  doctor: 'DR. CARLOS GARCIA MENDOZA (CMP 45120 / RNE 21094)',
  diag: 'K35.8 - APENDICITIS AGUDA FLEGMONOSA (DEFINITIVO)',
  textLines: [
    '### ANAMNESIS Y MOTIVO DE INGRESO',
    'Preescolar de 5 anos ingresa transferida desde Huancayo por cuadro de 24 horas',
    'caracterizado por dolor abdominal periumbilical que migra a fosa iliaca derecha,',
    'asociado a nauseas, vomitos de contenido alimentario en 2 oportunidades y fiebre.',
    '### EXAMEN FISICO REGIONAL',
    'Funciones Vitales: FC: 115 lpm, FR: 24 rpm, Temp: 38.6 C, SatO2: 98% ambiental.',
    'Abdomen doloroso en fosa iliaca derecha con contractura muscular involuntaria.',
    'Signo de McBurney positivo (++), Signo de Blumberg positivo (++), RHA disminuidos.',
    'Ecografia abdominal: Apendice cecal no compresible de 8.5 mm con liquido libre.',
    '### PROCEDIMIENTO Y ACTO QUIRURGICO',
    'Intervencion: Apendicectomia laparoscopica urgente bajo anestesia general balanceada.',
    'Hallazgos: Apendice flegmonoso con fibrina circundante. Cierre de base con endoloop.',
    'Evolucion postoperatoria favorable: Tolerancia oral a las 18h. Alta al 3er dia.',
    '### INDICACIONES DE ALTA Y MEDICACION',
    '1. Paracetamol jarabe 120mg/5ml: 7.5 ml VO cada 8 horas condicional a dolor.',
    '2. Curacion de incisiones laparoscopicas interdiarias. Retiro de puntos en 7 dias.',
    '3. Reposo relativo por 14 dias. Signos de alarma explicados a la madre.'
  ]
});

// 2. Matias Benitez - Emergencia Pediatrica (Convulsiones)
createSimplePdf(path.join(docsDir, 'hc-2025-09841.pdf'), {
  title: 'FICHA DE ATENCION DE URGENCIAS',
  docType: 'HOJA DE ATENCION EN EMERGENCIA PEDIATRICA',
  patientName: 'BENITEZ HUAMAN, MATIAS NICOLAS',
  hcNum: 'HC-2025-09841',
  dni: '82390145',
  date: '16/11/2026 03:40',
  service: 'EMERGENCIA PEDIATRICA - TOPICO DE OBSERVACION',
  doctor: 'DRA. LUCIA RAMOS SALAZAR (CMP 51294 / RNE 24108)',
  diag: 'R56.0 - CONVULSIONES FEBRILES SIMPLES / J02.9 FARINGITIS',
  textLines: [
    '### MOTIVO DE INGRESO POR URGENCIAS',
    'Lactante mayor de 3 anos ingresa traido por padres tras presentar episodio convulsivo',
    'tonico-clonico generalizado en domicilio con duracion de aprox. 3 minutos durante',
    'un pico febril agudo de 39.4 C. Periodo postictal de 15 min de somnolencia.',
    '### EXAMEN FISICO Y EVALUACION NEUROLOGICA',
    'Paciente somnoliento pero reactivo a la estimulacion vocal. Llanto energico.',
    'Pupilas isocoricas fotorreactivas. No rigidez de nuca, Brudzinski y Kernig negativos.',
    'Tono y reflejos osteotendinosos simetricos. Orofaringe marcadamente congestiva.',
    'Funciones Vitales: Temp: 39.2 C, FC: 130 lpm, FR: 28 rpm, SatO2: 97% ambiental.',
    '### TRATAMIENTO ADMINISTRADO Y PLAN',
    '1. Paracetamol 15 mg/kg VO en topico con descenso termico progresivo a 37.2 C.',
    '2. Medidas fisicas de control termico con compresas tibias y buena hidratacion.',
    '3. Prescripcion de Diazepam rectal 0.5 mg/kg CONDICIONAL a nueva crisis > 3 min.',
    '4. Observacion clinica por 4 horas con recuperacion total. Alta con interconsulta',
    '   ambulatoria a Neurologia Pediatrica para realizacion de Electroencefalograma.'
  ]
});

// 3. Camila Rojas - Neumologia Pediatrica (Asma)
createSimplePdf(path.join(docsDir, 'hc-2023-01742.pdf'), {
  title: 'HOJA DE EVOLUCION ESPECIALIZADA',
  docType: 'CONSULTORIO EXTERNO DE NEUMOLOGIA PEDIATRICA',
  patientName: 'ROJAS PAREDES, CAMILA ESPERANZA',
  hcNum: 'HC-2023-01742',
  dni: '75128934',
  date: '28/10/2026',
  service: 'CONSULTA EXTERNA NEUMOLOGIA PEDIATRICA',
  doctor: 'DR. FERNANDO ZAVALETA WONG (CMP 38920 / RNE 18450)',
  diag: 'J45.0 - ASMA PREDOMINANTEMENTE ALERGICA (CRISIS MODERADA)',
  textLines: [
    '### ENFERMEDAD ACTUAL Y SINTOMATOLOGIA',
    'Escolar de 7 anos con antecedente de asma alergica acude por presentar tos espasmodica,',
    'sensacion de falta de aire y sibilancias audibles tras exposicion a cambio de clima.',
    'Madre refiere haber administrado salbutamol inhalador con tecnica deficiente.',
    '### EXAMEN CLINICO DEL APARATO RESPIRATORIO',
    'Paciente colaboradora, polipneica leve con tiraje intercostal discreto.',
    'Funciones Vitales: SatO2: 93% aire ambiental, FR: 32 rpm, FC: 108 lpm, Temp: 36.8 C.',
    'Auscultacion: Murmullo vesicular rudo con sibilancias espiratorias e inspiratorias',
    'bilaterales difusas. Score de Bierman y Pierson: 6 puntos (Crisis Moderada).',
    '### TERAPIA DE RESCATE Y MANTENIMIENTO',
    '1. Rescate en consultorio: Salbutamol MDI 100 mcg (2 puff c/20 min x 3 ciclos con',
    '   aerocamara). Respuesta satisfactoria: SatO2 asciende a 97% y cede el tiraje.',
    '2. Domicilio: Salbutamol 100 mcg 2 puff c/6h x 5 dias, luego PRN.',
    '3. Controlador: Fluticasona aerosol 125 mcg: 1 puff cada 12 horas por 3 meses.',
    '4. Instruccion sobre higiene ambiental, lavado de ropa de cama y tecnica inhalatoria.'
  ]
});
