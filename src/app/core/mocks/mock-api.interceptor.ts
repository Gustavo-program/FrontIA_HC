import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { of, delay, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  MOCK_USUARIOS,
  MOCK_PACIENTES,
  MOCK_MEDICOS,
  MOCK_ESPECIALIDADES,
  MOCK_SERVICIOS,
  MOCK_CIE10,
  MOCK_TIPOS_DOCUMENTO,
  MOCK_CITAS,
  MOCK_ATENCIONES,
  MOCK_DOCUMENTOS,
  MOCK_REVISIONES,
  MOCK_HORARIOS,
  MOCK_AUDITORIA,
  MOCK_CONFIGURACION,
  MOCK_PERSONAL
} from './mock-data';
import { Cupo, Cita, HorarioMedico } from '../../shared/models/cita.model';
import { Atencion } from '../../shared/models/atencion.model';
import { DocumentoClinico } from '../../shared/models/documento.model';

const STORAGE_PREFIX = 'HC_INSN_V2_';

function syncStorage(type: 'pacientes' | 'citas' | 'horarios' | 'usuarios') {
  try {
    if (typeof localStorage === 'undefined') return;
    if (type === 'pacientes') localStorage.setItem(STORAGE_PREFIX + 'PACIENTES', JSON.stringify(MOCK_PACIENTES));
    if (type === 'citas') localStorage.setItem(STORAGE_PREFIX + 'CITAS', JSON.stringify(MOCK_CITAS));
    if (type === 'horarios') localStorage.setItem(STORAGE_PREFIX + 'HORARIOS', JSON.stringify(MOCK_HORARIOS));
    if (type === 'usuarios') localStorage.setItem(STORAGE_PREFIX + 'USUARIOS', JSON.stringify(MOCK_USUARIOS));
  } catch (e) {}
}

function initStorage() {
  try {
    if (typeof localStorage === 'undefined') return;

    const p = localStorage.getItem(STORAGE_PREFIX + 'PACIENTES');
    if (p) {
      const arr = JSON.parse(p);
      if (Array.isArray(arr) && arr.length > 0) {
        MOCK_PACIENTES.length = 0;
        MOCK_PACIENTES.push(...arr);
      }
    } else {
      localStorage.setItem(STORAGE_PREFIX + 'PACIENTES', JSON.stringify(MOCK_PACIENTES));
    }

    const c = localStorage.getItem(STORAGE_PREFIX + 'CITAS');
    if (c) {
      const arr = JSON.parse(c);
      if (Array.isArray(arr) && arr.length > 0) {
        MOCK_CITAS.length = 0;
        MOCK_CITAS.push(...arr);
      }
    } else {
      localStorage.setItem(STORAGE_PREFIX + 'CITAS', JSON.stringify(MOCK_CITAS));
    }

    const h = localStorage.getItem(STORAGE_PREFIX + 'HORARIOS');
    if (h) {
      const arr = JSON.parse(h);
      if (Array.isArray(arr) && arr.length > 0) {
        MOCK_HORARIOS.length = 0;
        MOCK_HORARIOS.push(...arr);
      }
    } else {
      localStorage.setItem(STORAGE_PREFIX + 'HORARIOS', JSON.stringify(MOCK_HORARIOS));
    }

    const u = localStorage.getItem(STORAGE_PREFIX + 'USUARIOS');
    if (u) {
      const arr = JSON.parse(u);
      if (Array.isArray(arr) && arr.length > 0) {
        MOCK_USUARIOS.length = 0;
        MOCK_USUARIOS.push(...arr);
      }
    } else {
      localStorage.setItem(STORAGE_PREFIX + 'USUARIOS', JSON.stringify(MOCK_USUARIOS));
    }
  } catch (e) {}
}

initStorage();

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.useMockApi || !req.url.includes('/api/v1')) {
    return next(req);
  }

  const url = req.url.substring(req.url.indexOf('/api/v1') + 7);
  const method = req.method;
  const body = req.body as any;

  // Simular delay de red
  const simDelay = 200;

  // 1. AUTH
  if (url === '/auth/login' && method === 'POST') {
    const user = MOCK_USUARIOS.find(u =>
      u.nombreUsuario.toLowerCase() === (body?.nombreUsuario || '').toLowerCase().trim() &&
      u.passwordHash === (body?.password || '').trim()
    );

    if (user) {
      const { passwordHash, ...safeUser } = user;
      return of(new HttpResponse({
        status: 200,
        body: {
          token: 'mock-jwt-token-' + user.usuarioId + '-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + user.usuarioId,
          usuario: safeUser
        }
      })).pipe(delay(simDelay));
    }

    return throwError(() => new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
      error: { message: 'Credenciales inválidas. Compruebe su usuario institucional y contraseña.' }
    })).pipe(delay(simDelay));
  }

  if (url === '/auth/me' && method === 'GET') {
    const { passwordHash, ...safeUser } = MOCK_USUARIOS[0];
    return of(new HttpResponse({ status: 200, body: safeUser })).pipe(delay(simDelay));
  }

  if (url === '/auth/cambiar-clave' && method === 'POST') {
    return of(new HttpResponse({ status: 200, body: { success: true, message: 'Contraseña actualizada correctamente.' } })).pipe(delay(simDelay));
  }

  // 2. PACIENTES
  if (url.startsWith('/pacientes') && method === 'GET') {
    if (url.includes('/historia-clinica')) {
      const pacId = url.split('/')[2];
      const pac = MOCK_PACIENTES.find(p => p.pacienteId === pacId) || MOCK_PACIENTES[0];
      return of(new HttpResponse({
        status: 200,
        body: {
          historiaClinicaId: pac.historiaClinicaId,
          pacienteId: pac.pacienteId,
          numeroHistoria: pac.numeroHistoria,
          fechaApertura: '2020-04-12',
          estadoHistoriaId: 'est-01',
          estadoHistoriaNombre: 'ACTIVA',
          establecimiento: 'INSN - Breña',
          pacienteNombres: pac.nombres,
          pacienteApellidos: pac.apellidoPaterno + ' ' + (pac.apellidoMaterno || '')
        }
      })).pipe(delay(simDelay));
    }

    if (url.includes('/atenciones')) {
      return of(new HttpResponse({ status: 200, body: MOCK_ATENCIONES })).pipe(delay(simDelay));
    }

    if (url.includes('/documentos')) {
      return of(new HttpResponse({ status: 200, body: MOCK_DOCUMENTOS })).pipe(delay(simDelay));
    }

    const segments = url.split('/');
    if (segments.length === 3 && segments[2]) {
      const id = segments[2];
      const pac = MOCK_PACIENTES.find(p => p.pacienteId === id);
      return of(new HttpResponse({ status: pac ? 200 : 404, body: pac || { message: 'Paciente no encontrado' } })).pipe(delay(simDelay));
    }

    // List paginated
    const search = req.params.get('search')?.toLowerCase().trim() || '';
    const filtered = MOCK_PACIENTES.filter(p => {
      if (!search) return true;
      const nom = (p.nombres || '').toLowerCase();
      const ape = (p.apellidoPaterno || '').toLowerCase();
      const apeM = (p.apellidoMaterno || '').toLowerCase();
      const full = `${nom} ${ape} ${apeM}`.trim();
      const hc = (p.numeroHistoria || '').toLowerCase();
      const doc = (p.documentoPrincipal?.numeroDocumento || '').toLowerCase();
      return nom.includes(search) || ape.includes(search) || full.includes(search) || hc.includes(search) || doc.includes(search);
    });

    return of(new HttpResponse({
      status: 200,
      body: {
        content: filtered,
        totalElements: filtered.length,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: filtered.length === 0
      }
    })).pipe(delay(simDelay));
  }

  if (url === '/pacientes' && method === 'POST') {
    const lastNum = MOCK_PACIENTES
      .map(p => parseInt(p.numeroHistoria || '0', 10))
      .filter(n => !isNaN(n) && n >= 1000000 && n <= 9999999)
      .sort((a, b) => b - a)[0] || 2026010;
    const nextHcNum = String(lastNum + 1);

    const newPac: any = {
      ...body,
      pacienteId: 'pac-' + Date.now(),
      codigoPaciente: 'PAC-' + Date.now().toString().slice(-4),
      numeroHistoria: nextHcNum,
      historiaClinicaId: 'hc-' + nextHcNum,
      estadoRegistro: 'ACTIVO',
      creadoEn: new Date().toISOString()
    };
    MOCK_PACIENTES.unshift(newPac);
    syncStorage('pacientes');
    return of(new HttpResponse({ status: 201, body: newPac })).pipe(delay(simDelay));
  }

  if (url.startsWith('/pacientes/') && method === 'PUT') {
    const id = url.split('/')[2];
    const idx = MOCK_PACIENTES.findIndex(p => p.pacienteId === id);
    if (idx >= 0) {
      MOCK_PACIENTES[idx] = { ...MOCK_PACIENTES[idx], ...body };
      syncStorage('pacientes');
      return of(new HttpResponse({ status: 200, body: MOCK_PACIENTES[idx] })).pipe(delay(simDelay));
    }
  }

  if (url.startsWith('/pacientes/') && method === 'DELETE') {
    const id = url.split('/')[2];
    const pac = MOCK_PACIENTES.find(p => p.pacienteId === id);
    if (pac) {
      pac.estadoRegistro = 'INACTIVO'; // Baja lógica RN-11
      syncStorage('pacientes');
    }
    return of(new HttpResponse({ status: 200, body: { success: true } })).pipe(delay(simDelay));
  }

  // 3. HISTORIAS
  if (url.startsWith('/historias/')) {
    const rawNum = decodeURIComponent(url.split('/')[2] || '').trim().toLowerCase();
    const cleanNum = rawNum.replace(/^hc-/, '');

    const pac = MOCK_PACIENTES.find(p => {
      const pNum = (p.numeroHistoria || '').toLowerCase();
      const pClean = pNum.replace(/^hc-/, '');
      const pDni = p.documentoPrincipal?.numeroDocumento?.toLowerCase() || '';
      return pClean === cleanNum || pNum === rawNum || pDni === rawNum || p.pacienteId.toLowerCase() === rawNum;
    }) || MOCK_PACIENTES[0];

    const pacAtenciones = MOCK_ATENCIONES.filter(a =>
      a.historiaClinicaId === pac.historiaClinicaId ||
      a.historiaClinicaId === ('hc-' + pac.numeroHistoria) ||
      (pac.numeroHistoria === '2026009' && a.atencionId === 'aten-fat-2026009')
    );

    const pacDocumentos = MOCK_DOCUMENTOS.filter(d =>
      d.numeroHistoria === pac.numeroHistoria ||
      d.historiaClinicaId === pac.historiaClinicaId ||
      (d.numeroHistoria && pac.numeroHistoria && d.numeroHistoria.includes(pac.numeroHistoria))
    );

    return of(new HttpResponse({
      status: 200,
      body: {
        paciente: pac,
        historia: {
          historiaClinicaId: pac.historiaClinicaId || 'hc-' + (pac.numeroHistoria || '01'),
          pacienteId: pac.pacienteId,
          numeroHistoria: pac.numeroHistoria || rawNum,
          fechaApertura: pac.numeroHistoria === '2026009' ? '2026-11-05' : '2020-04-12',
          estadoHistoriaNombre: 'ACTIVA',
          establecimiento: 'INSN - Breña'
        },
        atenciones: pacAtenciones,
        documentos: pacDocumentos
      }
    })).pipe(delay(simDelay));
  }

  // 4. CITAS & CUPOS
  if (url.startsWith('/medicos/') && url.includes('/cupos')) {
    const medId = url.split('/')[2];
    const fechaParam = req.params.get('fecha') || '';

    // RN-01: Turno de 6h (08:00 a 14:00) genera exactamente 12 cupos de 30 min
    const baseHorarios = [
      { ini: '08:00', fin: '08:30' },
      { ini: '08:30', fin: '09:00' },
      { ini: '09:00', fin: '09:30' },
      { ini: '09:30', fin: '10:00' },
      { ini: '10:00', fin: '10:30' },
      { ini: '10:30', fin: '11:00' },
      { ini: '11:00', fin: '11:30' },
      { ini: '11:30', fin: '12:00' },
      { ini: '12:00', fin: '12:30' },
      { ini: '12:30', fin: '13:00' },
      { ini: '13:00', fin: '13:30' },
      { ini: '13:30', fin: '14:00' }
    ];

    const cupos: Cupo[] = baseHorarios.map(h => {
      // Determinar si hay cita activa en esta fecha y hora
      const cita = MOCK_CITAS.find(c => {
        if (c.estado === 'CANCELADA') return false;
        if (medId && c.medicoId !== medId) return false;
        if (!c.fechaHoraInicio) return false;
        const cFecha = c.fechaHoraInicio.slice(0, 10);
        const cHora = c.fechaHoraInicio.slice(11, 16);
        return cFecha === fechaParam && cHora === h.ini;
      });

      if (cita) {
        const nom = cita.paciente ? `${cita.paciente.nombres} ${cita.paciente.apellidoPaterno}` : 'Paciente Agendado';
        return {
          horaInicio: h.ini,
          horaFin: h.fin,
          disponible: false,
          citaId: cita.citaId,
          pacienteNombre: nom
        };
      }

      return {
        horaInicio: h.ini,
        horaFin: h.fin,
        disponible: true
      };
    });

    return of(new HttpResponse({ status: 200, body: cupos })).pipe(delay(simDelay));
  }

  if (url.startsWith('/citas') && method === 'GET') {
    const estado = req.params.get('estado');
    const filtered = (estado ? MOCK_CITAS.filter(c => c.estado === estado) : [...MOCK_CITAS]).sort((a, b) => {
      const tA = new Date(a.fechaHoraInicio || 0).getTime();
      const tB = new Date(b.fechaHoraInicio || 0).getTime();
      return tB - tA;
    });
    return of(new HttpResponse({
      status: 200,
      body: {
        content: filtered,
        totalElements: filtered.length,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: filtered.length === 0
      }
    })).pipe(delay(simDelay));
  }

  if (url === '/citas' && method === 'POST') {
    const pac = MOCK_PACIENTES.find(p => p.pacienteId === body.pacienteId) || body.paciente;
    const med = MOCK_MEDICOS.find(m => m.medicoId === body.medicoId) || MOCK_MEDICOS[0];
    const esp = MOCK_ESPECIALIDADES.find(e => e.especialidadId === body.especialidadId) || (med?.especialidades?.[0]) || MOCK_ESPECIALIDADES[0];
    const newCita: Cita = {
      ...body,
      citaId: 'cita-' + Date.now(),
      paciente: pac,
      medico: med,
      especialidad: esp,
      creadoEn: new Date().toISOString()
    };
    MOCK_CITAS.unshift(newCita);
    syncStorage('citas');
    return of(new HttpResponse({ status: 201, body: newCita })).pipe(delay(simDelay));
  }

  if (url.startsWith('/citas/') && !url.includes('/estado') && method === 'PUT') {
    const id = url.split('/')[2];
    const idx = MOCK_CITAS.findIndex(c => c.citaId === id);
    if (idx >= 0) {
      const pac = body.pacienteId ? (MOCK_PACIENTES.find(p => p.pacienteId === body.pacienteId) || body.paciente || MOCK_CITAS[idx].paciente) : MOCK_CITAS[idx].paciente;
      const med = body.medicoId ? (MOCK_MEDICOS.find(m => m.medicoId === body.medicoId) || MOCK_CITAS[idx].medico) : MOCK_CITAS[idx].medico;
      const esp = body.especialidadId ? (MOCK_ESPECIALIDADES.find(e => e.especialidadId === body.especialidadId) || MOCK_CITAS[idx].especialidad) : MOCK_CITAS[idx].especialidad;
      MOCK_CITAS[idx] = {
        ...MOCK_CITAS[idx],
        ...body,
        fechaHoraInicio: body.fechaHoraInicio || MOCK_CITAS[idx].fechaHoraInicio,
        fechaHoraFin: body.fechaHoraFin || MOCK_CITAS[idx].fechaHoraFin,
        paciente: pac,
        medico: med,
        especialidad: esp,
        actualizadoEn: new Date().toISOString()
      };
      syncStorage('citas');
      return of(new HttpResponse({ status: 200, body: MOCK_CITAS[idx] })).pipe(delay(simDelay));
    }
    return of(new HttpResponse({ status: 404, body: { message: 'Cita no encontrada' } })).pipe(delay(simDelay));
  }

  if (url.startsWith('/citas/') && method === 'DELETE') {
    const id = url.split('/')[2];
    const idx = MOCK_CITAS.findIndex(c => c.citaId === id);
    if (idx >= 0) {
      MOCK_CITAS.splice(idx, 1);
      syncStorage('citas');
    }
    return of(new HttpResponse({ status: 200, body: { success: true } })).pipe(delay(simDelay));
  }

  if (url.startsWith('/citas/') && url.includes('/estado') && method === 'PATCH') {
    const id = url.split('/')[2];
    const cita = MOCK_CITAS.find(c => c.citaId === id);
    if (cita) {
      cita.estado = body.estado;
      if (body.estado === 'APROBADA') {
        cita.aprobadoPor = 'Admin';
        cita.fechaAprobacion = new Date().toISOString();
      }
      syncStorage('citas');
      return of(new HttpResponse({ status: 200, body: cita })).pipe(delay(simDelay));
    }
  }

  // 5. ATENCIÓN MÉDICA
  if (url.startsWith('/atenciones/agenda')) {
    // Agenda del día del doctor: citas APROBADAS
    const agendaCitas = MOCK_CITAS.filter(c => c.estado === 'APROBADA');
    return of(new HttpResponse({ status: 200, body: agendaCitas })).pipe(delay(simDelay));
  }

  if (url === '/atenciones' && method === 'POST') {
    const newAtencion: Atencion = {
      ...body,
      atencionId: 'aten-' + Date.now(),
      fechaAtencion: new Date().toISOString()
    };
    MOCK_ATENCIONES.unshift(newAtencion);
    return of(new HttpResponse({ status: 201, body: newAtencion })).pipe(delay(simDelay));
  }

  if (url.startsWith('/atenciones/') && method === 'PUT') {
    const id = url.split('/')[2];
    const idx = MOCK_ATENCIONES.findIndex(a => a.atencionId === id);
    if (idx >= 0) {
      MOCK_ATENCIONES[idx] = { ...MOCK_ATENCIONES[idx], ...body };
      return of(new HttpResponse({ status: 200, body: MOCK_ATENCIONES[idx] })).pipe(delay(simDelay));
    }
  }

  if (url.startsWith('/atenciones/') && url.includes('/finalizar') && method === 'POST') {
    const id = url.split('/')[2];
    const aten = MOCK_ATENCIONES.find(a => a.atencionId === id);
    if (aten) {
      aten.estado = 'FINALIZADA';
      return of(new HttpResponse({ status: 200, body: aten })).pipe(delay(simDelay));
    }
  }

  // 6. RECETAS
  if (url.startsWith('/recetas/') && url.includes('/enviar') && method === 'POST') {
    return of(new HttpResponse({
      status: 200,
      body: {
        success: true,
        mensaje: `Receta enviada exitosamente por ${body.canal} al destinatario ${body.destino}`
      }
    })).pipe(delay(simDelay));
  }

  // 7. DIGITALIZACIÓN Y VALIDACIÓN
  if (url === '/digitalizacion/documentos' && method === 'POST') {
    // Extracción de nombre de archivo real si viene por FormData
    let uploadedFileName = 'FAT_3348_2026_Teleinterconsulta_Cardiologia.pdf';
    let fileSizeBytes = 1420000;
    if (body instanceof FormData) {
      const file = body.get('archivo') as File;
      if (file && file.name) {
        uploadedFileName = file.name;
        fileSizeBytes = file.size || 1420000;
      }
    }

    // Asegurar paciente en base de datos (solo los datos necesarios del paciente)
    let pacienteExistente = MOCK_PACIENTES.find(p => p.numeroHistoria === '2026009' || p.documentoPrincipal?.numeroDocumento === '90247117');
    if (!pacienteExistente) {
      pacienteExistente = {
        pacienteId: 'pac-04',
        codigoPaciente: 'PAC-2026-0004',
        nombres: 'JHUNIOR ADAEL',
        apellidoPaterno: 'NEIRA',
        apellidoMaterno: 'CARHUAPOMA',
        fechaNacimiento: '2017-05-10',
        sexoRegistrado: 'MASCULINO',
        lugarNacimiento: 'Trujillo - La Libertad',
        paisNacimiento: 'Perú',
        estadoRegistro: 'ACTIVO',
        numeroHistoria: '2026009',
        historiaClinicaId: 'hc-2026009',
        documentoPrincipal: {
          documentoIdentidadId: 'doc-pac-04',
          tipoDocumentoId: 'td-01',
          numeroDocumento: '90247117',
          esPrincipal: true,
          estadoValidacion: 'VALIDADO'
        },
        responsables: [
          {
            responsableId: 'resp-04',
            nombres: 'Rosa',
            apellidoPaterno: 'Carhuapoma',
            apellidoMaterno: 'Pérez',
            tipoDocumentoId: 'td-01',
            numeroDocumento: '42981726',
            telefono: '947487707',
            telefonoWhatsapp: '947487707',
            correo: 'familia.neira@gmail.com',
            direccion: 'Av. España 1120, Trujillo (Referido a INSN Breña)',
            parentesco: 'Madre',
            esContactoPrincipal: true
          }
        ],
        creadoEn: '2026-11-05T11:56:00Z'
      };
      MOCK_PACIENTES.unshift(pacienteExistente);
    }

    // Asegurar la atención médica en la HC (solo los datos clínicos necesarios: diagnóstico, triaje, hallazgos y plan)
    const atencionExistente = MOCK_ATENCIONES.find(a => a.historiaClinicaId === 'hc-2026009' || a.atencionId === 'aten-fat-2026009');
    if (!atencionExistente) {
      MOCK_ATENCIONES.unshift({
        atencionId: 'aten-fat-2026009',
        historiaClinicaId: 'hc-2026009',
        citaId: 'cita-fat-01',
        medicoId: 'med-02',
        medicoNombre: 'Dr. ESTELA CHUNGA EDILBERTO (CMP 19116 / RNE 12250)',
        servicioId: 'ser-02',
        servicioNombre: 'CARDIOLOGÍA - INSN BREÑA',
        fechaAtencion: '2026-11-05T11:56:00Z',
        motivoConsulta: 'Teleinterconsulta Especializada - Displasia Tricuspídea Tipo Ebstein vs Aneurisma de Aurícula Derecha Idiopática',
        antecedentes: 'Paciente pediátrico de 9 años derivado desde Hospital Belén de Trujillo. Sin antecedentes quirúrgicos cardiovasculares previos.',
        observaciones: 'Ecocardiografía (14/10/2026): Displasia Tricuspídea Tipo Ebstein vs Aneurisma de Aurícula Derecha Idiopática. Dilatación severa de aurícula derecha, cavidades izquierdas normales. EKG (14/10/2026): BIRD + bradicardia sinusal. Radiología: ICT= 0.70. Crecimiento de cavidades derechas. FP disminuido. Triaje: Peso 27.50 kg, Talla 1.33 m.',
        recomendaciones: '1. Definir diagnóstico con nuevo ecocardiograma realizado en INSN-Breña.\n2. De comprobarse Displasia tricúspidea, el tratamiento quirúrgico debe ser hecho en INSN-San Borja.\n3. Necesitaría evaluación por electrofisiología para posibilidad de colocación de marcapaso.\n4. Descartar DVAPP.\n5. Estabilizado el paciente debe referirse a Consultorio Externo de Cardiología - INSN Breña a través del REFCON.',
        estado: 'FINALIZADA',
        origen: 'DIGITALIZACION',
        documentoClinicoId: 'doc-fat-2026009',
        esExtraidoPorIA: true,
        diagnosticos: [
          {
            cie10Id: 'cie-13',
            cie10: { cie10Id: 'cie-13', codigo: 'Q22.5', descripcion: 'ANOMALÍA DE EBSTEIN', activo: true },
            tipo: 'PRINCIPAL',
            observaciones: 'Presuntivo - Displasia Tricuspídea'
          },
          {
            cie10Id: 'cie-14',
            cie10: { cie10Id: 'cie-14', codigo: '9949911', descripcion: 'TELEINTERCONSULTA SINCRONA O EN LINEA', activo: true },
            tipo: 'SECUNDARIO',
            observaciones: 'Definitivo - Modalidad Síncrona'
          }
        ]
      });
    }

    // Calcula confiabilidad (94% para incorporación automática; si supera 85%, directo a HC)
    const randConf = 94;
    const superaUmbral = randConf >= 85;

    const newDoc: DocumentoClinico = {
      documentoClinicoId: 'doc-' + Date.now(),
      historiaClinicaId: 'hc-2026009',
      numeroHistoria: '2026009',
      pacienteNombres: 'NEIRA CARHUAPOMA JHUNIOR ADAEL',
      nombreArchivoOriginal: uploadedFileName,
      sha256: 'sha256-' + Math.random().toString(36).substring(2),
      numeroPaginas: 2,
      tamanoBytes: fileSizeBytes,
      recibidoEn: new Date().toISOString(),
      estadoProcesamiento: superaUmbral ? 'PROCESADO' : 'REQUIERE_REVISION',
      estadoValidacion: superaUmbral ? 'VALIDADO' : 'REQUIERE_REVISION',
      confiabilidadPromedio: randConf,
      enlaceHC: '/historias/2026009',
      urlPdf: '/docs/hc-2026009.pdf',
      revisionId: !superaUmbral ? 'rev-' + Date.now() : undefined
    };

    MOCK_DOCUMENTOS.unshift(newDoc);

    if (!superaUmbral) {
      MOCK_REVISIONES.unshift({
        revisionId: newDoc.revisionId!,
        documentoClinicoId: newDoc.documentoClinicoId,
        documento: newDoc,
        motivo: `Confiabilidad (${randConf}%) menor al umbral del 85%`,
        estado: 'PENDIENTE',
        confiabilidadPromedio: randConf,
        creadaEn: new Date().toISOString(),
        campos: [
          { nombreCampo: 'numero_historia', etiqueta: 'N° Historia Clínica', valorExtraido: '2026009', confianza: 0.98, estadoValidacion: 'VALIDADO' },
          { nombreCampo: 'numero_documento', etiqueta: 'DNI Paciente', valorExtraido: '90247117', confianza: 0.97, estadoValidacion: 'VALIDADO' },
          { nombreCampo: 'nombres_paciente', etiqueta: 'Nombres del Paciente', valorExtraido: 'JHUNIOR ADAEL', confianza: 0.95, estadoValidacion: 'VALIDADO' },
          { nombreCampo: 'apellidos_paciente', etiqueta: 'Apellidos del Paciente', valorExtraido: 'NEIRA CARHUAPOMA', confianza: 0.94, estadoValidacion: 'VALIDADO' },
          { nombreCampo: 'sexo', etiqueta: 'Sexo', valorExtraido: 'MASCULINO', confianza: 0.99, estadoValidacion: 'VALIDADO' },
          { nombreCampo: 'triaje_antropometrico', etiqueta: 'Triaje (Peso / Talla)', valorExtraido: 'Peso: 27.50 Kg | Talla: 1.33 m', confianza: 0.92, estadoValidacion: 'VALIDADO' },
          { nombreCampo: 'servicio_especialidad', etiqueta: 'Servicio / Especialidad', valorExtraido: 'CARDIOLOGIA', confianza: 0.96, estadoValidacion: 'VALIDADO' },
          { nombreCampo: 'medico_especialista', etiqueta: 'Médico Consultor (CMP / RNE)', valorExtraido: 'Dr. ESTELA CHUNGA EDILBERTO (CMP 19116 / RNE 12250)', confianza: 0.91, estadoValidacion: 'VALIDADO' },
          { nombreCampo: 'diagnostico_cie10', etiqueta: 'Diagnóstico Principal CIE-10', valorExtraido: 'Q22.5 - ANOMALÍA DE EBSTEIN (Presuntivo)', confianza: 0.88, estadoValidacion: 'VALIDADO' },
          { nombreCampo: 'hallazgos_clinicos', etiqueta: 'Hallazgos Relevantes / Examen', valorExtraido: 'Ecocardiografía: Displasia Tricuspídea Tipo Ebstein vs Aneurisma de Aurícula Derecha. Dilatación severa AD. EKG: BIRD + bradicardia.', confianza: 0.79, estadoValidacion: 'PENDIENTE' },
          { nombreCampo: 'plan_recomendaciones', etiqueta: 'Plan y Recomendaciones', valorExtraido: 'Ecocardiograma en INSN-Breña. Evaluación por electrofisiología para marcapaso. Ref. a CE Cardiología por REFCON.', confianza: 0.82, estadoValidacion: 'PENDIENTE' }
        ]
      });
    }

    return of(new HttpResponse({ status: 201, body: newDoc })).pipe(delay(simDelay));
  }

  if (url === '/digitalizacion/documentos' && method === 'GET') {
    return of(new HttpResponse({
      status: 200,
      body: {
        content: MOCK_DOCUMENTOS,
        totalElements: MOCK_DOCUMENTOS.length,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: MOCK_DOCUMENTOS.length === 0
      }
    })).pipe(delay(simDelay));
  }

  if (url.startsWith('/digitalizacion/documentos/') && method === 'DELETE') {
    const docId = url.split('/')[3];
    const idx = MOCK_DOCUMENTOS.findIndex(d => d.documentoClinicoId === docId);
    if (idx >= 0) {
      MOCK_DOCUMENTOS.splice(idx, 1);
    }
    const revIdx = MOCK_REVISIONES.findIndex(r => r.documentoClinicoId === docId);
    if (revIdx >= 0) {
      MOCK_REVISIONES.splice(revIdx, 1);
    }
    return of(new HttpResponse({ status: 200, body: { success: true, message: 'Documento escaneado eliminado correctamente.' } })).pipe(delay(simDelay));
  }

  if (url.includes('/reprocesar') && method === 'POST') {
    const docId = url.split('/')[2];
    const doc = MOCK_DOCUMENTOS.find(d => d.documentoClinicoId === docId);
    if (doc) {
      doc.estadoProcesamiento = 'PROCESADO';
      doc.estadoValidacion = 'VALIDADO';
      doc.confiabilidadPromedio = 94;
      doc.enlaceHC = '/historias/' + (doc.numeroHistoria || '2026009');
      return of(new HttpResponse({ status: 200, body: doc })).pipe(delay(simDelay));
    }
  }

  // Validación
  if (url.startsWith('/validacion/revisiones') && method === 'GET') {
    const segments = url.split('/');
    if (segments.length === 4 && segments[3]) {
      const rev = MOCK_REVISIONES.find(r => r.revisionId === segments[3]) || MOCK_REVISIONES[0];
      return of(new HttpResponse({ status: 200, body: rev })).pipe(delay(simDelay));
    }

    return of(new HttpResponse({
      status: 200,
      body: {
        content: MOCK_REVISIONES,
        totalElements: MOCK_REVISIONES.length,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: MOCK_REVISIONES.length === 0
      }
    })).pipe(delay(simDelay));
  }

  if (url.includes('/autorizar') && method === 'POST') {
    const revId = url.split('/')[3];
    const rev = MOCK_REVISIONES.find(r => r.revisionId === revId);
    if (rev) {
      rev.estado = 'APROBADA';
      if (rev.documento) {
        rev.documento.estadoValidacion = 'VALIDADO';
        rev.documento.estadoProcesamiento = 'PROCESADO';
        rev.documento.enlaceHC = '/historias/' + (rev.documento.numeroHistoria || '2026009');
      }
      return of(new HttpResponse({ status: 200, body: { success: true, message: 'Historia Clínica autorizada e incorporada a la base de datos.' } })).pipe(delay(simDelay));
    }
  }

  if (url.includes('/devolver') && method === 'POST') {
    const revId = url.split('/')[3];
    const rev = MOCK_REVISIONES.find(r => r.revisionId === revId);
    if (rev) {
      rev.estado = 'DEVUELTA';
      rev.observaciones = body.motivo;
      return of(new HttpResponse({ status: 200, body: { success: true, message: 'Revisión devuelta correctamente.' } })).pipe(delay(simDelay));
    }
  }

  // 8. HORARIOS (RR. HH.)
  if (url.startsWith('/horarios') && method === 'GET') {
    return of(new HttpResponse({ status: 200, body: MOCK_HORARIOS })).pipe(delay(simDelay));
  }

  if (url === '/horarios' && method === 'POST') {
    const nuevoHorario: HorarioMedico = {
      ...body,
      horarioId: 'hor-' + Date.now(),
      estado: 'ACTIVO',
      cuposTotales: 12,
      cuposLibres: 12
    };
    MOCK_HORARIOS.unshift(nuevoHorario);
    syncStorage('horarios');
    return of(new HttpResponse({ status: 201, body: nuevoHorario })).pipe(delay(simDelay));
  }

  if (url.startsWith('/horarios/') && method === 'PUT') {
    const id = url.split('/')[2];
    const idx = MOCK_HORARIOS.findIndex(h => h.horarioId === id);
    if (idx >= 0) {
      MOCK_HORARIOS[idx] = { ...MOCK_HORARIOS[idx], ...body };
      syncStorage('horarios');
      return of(new HttpResponse({ status: 200, body: MOCK_HORARIOS[idx] })).pipe(delay(simDelay));
    }
  }

  if (url.startsWith('/horarios/') && method === 'DELETE') {
    const id = url.split('/')[2];
    const idx = MOCK_HORARIOS.findIndex(h => h.horarioId === id);
    if (idx >= 0) {
      MOCK_HORARIOS.splice(idx, 1);
      syncStorage('horarios');
    }
    return of(new HttpResponse({ status: 200, body: { success: true } })).pipe(delay(simDelay));
  }

  // 9. REPORTES
  if (url.startsWith('/reportes/atenciones')) {
    return of(new HttpResponse({
      status: 200,
      body: {
        totalAtenciones: 142,
        totalPacientes: 98,
        atencionesPorMes: [
          { mes: 'Junio', cantidad: 18 },
          { mes: 'Julio', cantidad: 22 },
          { mes: 'Agosto', cantidad: 27 },
          { mes: 'Septiembre', cantidad: 24 },
          { mes: 'Octubre', cantidad: 31 },
          { mes: 'Noviembre', cantidad: 20 }
        ],
        topDiagnosticos: [
          { codigo: 'J00', descripcion: 'Rinofaringitis aguda', cantidad: 38 },
          { codigo: 'J02.9', descripcion: 'Faringitis aguda', cantidad: 29 },
          { codigo: 'J20.9', descripcion: 'Bronquitis aguda', cantidad: 21 },
          { codigo: 'A09', descripcion: 'Gastroenteritis aguda', cantidad: 18 },
          { codigo: 'J45.9', descripcion: 'Asma no especificada', cantidad: 15 }
        ]
      }
    })).pipe(delay(simDelay));
  }

  // 10. AUDITORÍA
  if (url.startsWith('/auditoria')) {
    return of(new HttpResponse({
      status: 200,
      body: {
        content: MOCK_AUDITORIA,
        totalElements: MOCK_AUDITORIA.length,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: false
      }
    })).pipe(delay(simDelay));
  }

  // 11. CATÁLOGOS Y ADMINISTRACIÓN
  if (url.startsWith('/catalogos/cie10')) {
    const q = req.params.get('q')?.toLowerCase() || '';
    const filtered = MOCK_CIE10.filter(c => c.codigo.toLowerCase().includes(q) || c.descripcion.toLowerCase().includes(q));
    return of(new HttpResponse({ status: 200, body: filtered })).pipe(delay(simDelay));
  }

  if (url === '/catalogos/tipos-documento') {
    return of(new HttpResponse({ status: 200, body: MOCK_TIPOS_DOCUMENTO })).pipe(delay(simDelay));
  }

  if (url === '/especialidades') {
    return of(new HttpResponse({ status: 200, body: MOCK_ESPECIALIDADES })).pipe(delay(simDelay));
  }

  if (url === '/servicios') {
    return of(new HttpResponse({ status: 200, body: MOCK_SERVICIOS })).pipe(delay(simDelay));
  }

  if (url === '/parametros') {
    return of(new HttpResponse({ status: 200, body: MOCK_CONFIGURACION })).pipe(delay(simDelay));
  }

  if (url.startsWith('/parametros/') && method === 'PUT') {
    const clave = url.split('/')[2];
    const cfg = MOCK_CONFIGURACION.find(c => c.clave === clave);
    if (cfg) {
      cfg.valor = body.valor;
      return of(new HttpResponse({ status: 200, body: cfg })).pipe(delay(simDelay));
    }
  }

  // 12. CRUD PERSONAL (RF-ADMIN-03)
  if (url === '/personal' && method === 'GET') {
    const search = req.params.get('search')?.toLowerCase() || '';
    const tipo = req.params.get('tipo')?.toLowerCase() || '';
    const filtered = MOCK_PERSONAL.filter(p =>
      (!search || p.nombres.toLowerCase().includes(search) || p.apellidoPaterno.toLowerCase().includes(search) || (p.codigoInstitucional && p.codigoInstitucional.toLowerCase().includes(search))) &&
      (!tipo || (p.tipoPersonalNombre && p.tipoPersonalNombre.toLowerCase().includes(tipo)))
    );

    return of(new HttpResponse({
      status: 200,
      body: {
        content: filtered,
        totalElements: filtered.length,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: filtered.length === 0
      }
    })).pipe(delay(simDelay));
  }

  if (url === '/personal' && method === 'POST') {
    const newPer = {
      ...body,
      personalId: 'per-' + Date.now(),
      estado: 'ACTIVO'
    };
    MOCK_PERSONAL.unshift(newPer);
    return of(new HttpResponse({ status: 201, body: newPer })).pipe(delay(simDelay));
  }

  if (url.startsWith('/personal/') && method === 'PUT') {
    const id = url.split('/')[2];
    const idx = MOCK_PERSONAL.findIndex(p => p.personalId === id);
    if (idx >= 0) {
      MOCK_PERSONAL[idx] = { ...MOCK_PERSONAL[idx], ...body };
      return of(new HttpResponse({ status: 200, body: MOCK_PERSONAL[idx] })).pipe(delay(simDelay));
    }
  }

  if (url.startsWith('/personal/') && method === 'DELETE') {
    const id = url.split('/')[2];
    const idx = MOCK_PERSONAL.findIndex(p => p.personalId === id);
    if (idx >= 0) {
      MOCK_PERSONAL.splice(idx, 1);
    }
    return of(new HttpResponse({ status: 200, body: { success: true } })).pipe(delay(simDelay));
  }

  // 13. CRUD MEDICOS (RF-ADMIN-02)
  if (url === '/medicos' && method === 'GET') {
    const search = req.params.get('search')?.toLowerCase() || '';
    const espId = req.params.get('especialidadId') || '';
    const filtered = MOCK_MEDICOS.filter(m =>
      (!search || m.personal.nombres.toLowerCase().includes(search) || m.personal.apellidoPaterno.toLowerCase().includes(search) || m.numeroCmp.includes(search)) &&
      (!espId || m.especialidades.some(e => e.especialidadId === espId))
    );

    return of(new HttpResponse({
      status: 200,
      body: {
        content: filtered,
        totalElements: filtered.length,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: filtered.length === 0
      }
    })).pipe(delay(simDelay));
  }

  if (url.startsWith('/medicos/') && method === 'GET' && !url.includes('/cupos')) {
    const id = url.split('/')[2];
    const med = MOCK_MEDICOS.find(m => m.medicoId === id);
    return of(new HttpResponse({ status: med ? 200 : 404, body: med || { message: 'Médico no encontrado' } })).pipe(delay(simDelay));
  }

  if (url === '/medicos' && method === 'POST') {
    const perId = 'per-' + Date.now();
    const newPer = {
      personalId: perId,
      codigoInstitucional: 'MED-' + Math.floor(10000 + Math.random() * 90000),
      tipoPersonalId: 'tp-01',
      tipoPersonalNombre: 'Médico Especialista',
      nombres: body.nombres,
      apellidoPaterno: body.apellidoPaterno,
      apellidoMaterno: body.apellidoMaterno || '',
      tipoDocumentoId: 'td-01',
      numeroDocumento: body.numeroDocumento || '00000000',
      correoInstitucional: body.correoInstitucional || 'doctor@insn.gob.pe',
      telefono: body.telefono || '',
      estado: 'ACTIVO' as const
    };
    MOCK_PERSONAL.unshift(newPer);

    const newMed = {
      medicoId: 'med-' + Date.now(),
      personalId: perId,
      personal: newPer,
      numeroCmp: body.numeroCmp,
      numeroRne: body.numeroRne || '',
      verificacionCmp: 'VERIFICADO' as const,
      especialidades: body.especialidades || [MOCK_ESPECIALIDADES[0]],
      observaciones: body.observaciones || ''
    };
    MOCK_MEDICOS.unshift(newMed);
    return of(new HttpResponse({ status: 201, body: newMed })).pipe(delay(simDelay));
  }

  if (url.startsWith('/medicos/') && method === 'PUT') {
    const id = url.split('/')[2];
    const idx = MOCK_MEDICOS.findIndex(m => m.medicoId === id);
    if (idx >= 0) {
      const med = MOCK_MEDICOS[idx];
      med.numeroCmp = body.numeroCmp ?? med.numeroCmp;
      med.numeroRne = body.numeroRne ?? med.numeroRne;
      med.observaciones = body.observaciones ?? med.observaciones;
      if (body.especialidades) {
        med.especialidades = body.especialidades;
      }
      if (body.nombres || body.apellidoPaterno) {
        med.personal.nombres = body.nombres ?? med.personal.nombres;
        med.personal.apellidoPaterno = body.apellidoPaterno ?? med.personal.apellidoPaterno;
        med.personal.apellidoMaterno = body.apellidoMaterno ?? med.personal.apellidoMaterno;
        med.personal.telefono = body.telefono ?? med.personal.telefono;
        med.personal.correoInstitucional = body.correoInstitucional ?? med.personal.correoInstitucional;
      }
      return of(new HttpResponse({ status: 200, body: med })).pipe(delay(simDelay));
    }
  }

  if (url.startsWith('/medicos/') && method === 'DELETE') {
    const id = url.split('/')[2];
    const idx = MOCK_MEDICOS.findIndex(m => m.medicoId === id);
    if (idx >= 0) {
      MOCK_MEDICOS.splice(idx, 1);
    }
    return of(new HttpResponse({ status: 200, body: { success: true } })).pipe(delay(simDelay));
  }

  // 14. CRUD USUARIOS (RF-ADMIN-01)
  if (url === '/usuarios' && method === 'GET') {
    const search = req.params.get('search')?.toLowerCase() || '';
    const safeUsers = MOCK_USUARIOS.map(({ passwordHash, ...u }) => ({
      ...u,
      activo: (u as any).activo ?? true
    })).filter(u =>
      !search ||
      u.nombreUsuario.toLowerCase().includes(search) ||
      u.nombreCompleto.toLowerCase().includes(search) ||
      u.correo.toLowerCase().includes(search)
    );

    return of(new HttpResponse({
      status: 200,
      body: {
        content: safeUsers,
        totalElements: safeUsers.length,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: safeUsers.length === 0
      }
    })).pipe(delay(simDelay));
  }

  if (url.startsWith('/usuarios/') && !url.includes('/estado') && method === 'GET') {
    const id = url.split('/')[2];
    const usr: any = MOCK_USUARIOS.find(u => u.usuarioId === id);
    if (usr) {
      const { passwordHash, ...safe } = usr;
      return of(new HttpResponse({ status: 200, body: safe })).pipe(delay(simDelay));
    }
    return throwError(() => ({ status: 404, error: { message: 'Usuario no encontrado' } }));
  }

  if (url === '/usuarios' && method === 'POST') {
    const rolMap: Record<string, { rolId: string; codigo: any; nombre: string }> = {
      ADMIN: { rolId: 'r-admin', codigo: 'ADMIN', nombre: 'Administrador General' },
      DOCTOR: { rolId: 'r-doc', codigo: 'DOCTOR', nombre: 'Médico Asistencial' },
      DIGITALIZADOR: { rolId: 'r-dig', codigo: 'DIGITALIZADOR', nombre: 'Personal de Archivo / Digitalizador' },
      ADMISION: { rolId: 'r-adm', codigo: 'ADMISION', nombre: 'Personal de Admisión' },
      RRHH: { rolId: 'r-rrhh', codigo: 'RRHH', nombre: 'Recursos Humanos' }
    };

    const rolObj = rolMap[body.rolCodigo] || rolMap['DOCTOR'];

    const newUsr: any = {
      usuarioId: 'u-' + Date.now(),
      nombreUsuario: body.nombreUsuario.trim().toLowerCase(),
      passwordHash: body.password || '12345678',
      nombreCompleto: body.nombreCompleto,
      correo: body.correo,
      roles: [rolObj],
      debeCambiarClave: body.debeCambiarClave ?? false,
      activo: body.activo ?? true
    };

    MOCK_USUARIOS.unshift(newUsr);
    syncStorage('usuarios');
    const { passwordHash, ...safe } = newUsr;
    return of(new HttpResponse({ status: 201, body: safe })).pipe(delay(simDelay));
  }

  if (url.startsWith('/usuarios/') && url.includes('/estado') && method === 'PATCH') {
    const id = url.split('/')[2];
    const usr: any = MOCK_USUARIOS.find(u => u.usuarioId === id);
    if (usr) {
      usr.activo = body.activo;
      syncStorage('usuarios');
      const { passwordHash, ...safe } = usr;
      return of(new HttpResponse({ status: 200, body: safe })).pipe(delay(simDelay));
    }
  }

  if (url.startsWith('/usuarios/') && method === 'PUT') {
    const id = url.split('/')[2];
    const usr: any = MOCK_USUARIOS.find(u => u.usuarioId === id);
    if (usr) {
      usr.nombreCompleto = body.nombreCompleto ?? usr.nombreCompleto;
      usr.correo = body.correo ?? usr.correo;
      usr.debeCambiarClave = body.debeCambiarClave ?? usr.debeCambiarClave;
      if (body.password) {
        usr.passwordHash = body.password;
      }
      if (body.rolCodigo) {
        const rolMap: Record<string, { rolId: string; codigo: any; nombre: string }> = {
          ADMIN: { rolId: 'r-admin', codigo: 'ADMIN', nombre: 'Administrador General' },
          DOCTOR: { rolId: 'r-doc', codigo: 'DOCTOR', nombre: 'Médico Asistencial' },
          DIGITALIZADOR: { rolId: 'r-dig', codigo: 'DIGITALIZADOR', nombre: 'Personal de Archivo / Digitalizador' },
          ADMISION: { rolId: 'r-adm', codigo: 'ADMISION', nombre: 'Personal de Admisión' },
          RRHH: { rolId: 'r-rrhh', codigo: 'RRHH', nombre: 'Recursos Humanos' }
        };
        usr.roles = [rolMap[body.rolCodigo] || rolMap['DOCTOR']];
      }
      syncStorage('usuarios');
      const { passwordHash, ...safe } = usr;
      return of(new HttpResponse({ status: 200, body: safe })).pipe(delay(simDelay));
    }
  }

  if (url.startsWith('/usuarios/') && method === 'DELETE') {
    const id = url.split('/')[2];
    const idx = MOCK_USUARIOS.findIndex(u => u.usuarioId === id);
    if (idx >= 0) {
      MOCK_USUARIOS.splice(idx, 1);
      syncStorage('usuarios');
    }
    return of(new HttpResponse({ status: 200, body: { success: true } })).pipe(delay(simDelay));
  }

  return next(req);
};
