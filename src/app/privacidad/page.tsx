import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Política de privacidad y protección de datos de Inclusia.',
  robots: { index: false, follow: false },
}

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>

        <div className="bg-white rounded-2xl border p-8 md:p-12 prose prose-sm max-w-none">
          <h1 className="text-3xl font-bold mb-2">Política de privacidad</h1>
          <p className="text-muted-foreground text-sm mb-8">Última actualización: junio de 2025</p>

          <h2>1. Responsable del tratamiento</h2>
          <p>
            El responsable del tratamiento de tus datos personales es <strong>Inclusia</strong>,
            con domicilio en España. Puedes contactarnos en{' '}
            <a href="mailto:privacidad@inclusia.es" className="text-primary">privacidad@inclusia.es</a>.
          </p>

          <h2>2. Datos que recopilamos</h2>
          <p>Recopilamos los siguientes tipos de datos personales:</p>
          <ul>
            <li><strong>Datos de registro:</strong> nombre completo, dirección de correo electrónico y contraseña cifrada.</li>
            <li><strong>Datos de perfil profesional:</strong> ciudad, provincia, teléfono, especialidades, experiencia, disponibilidad, CV (si lo adjuntas) y foto.</li>
            <li><strong>Datos de perfil de centro:</strong> nombre del centro, tipo, CIF, descripción, ubicación, web y datos de contacto.</li>
            <li><strong>Datos de uso:</strong> candidaturas enviadas, mensajes de chat, notificaciones y actividad en la Plataforma.</li>
            <li><strong>Datos de pago:</strong> gestionados íntegramente por Stripe. Inclusia no almacena datos de tarjetas de crédito.</li>
          </ul>

          <h2>3. Finalidad y base legal del tratamiento</h2>
          <p>Tratamos tus datos con las siguientes finalidades y bases legales:</p>
          <ul>
            <li><strong>Prestación del servicio</strong> (ejecución del contrato): gestión de tu cuenta, publicación de ofertas, tramitación de candidaturas y comunicación entre usuarios.</li>
            <li><strong>Cumplimiento de obligaciones legales:</strong> facturación, obligaciones fiscales y contables.</li>
            <li><strong>Interés legítimo:</strong> seguridad de la Plataforma, prevención del fraude y mejora del servicio.</li>
            <li><strong>Consentimiento:</strong> envío de comunicaciones de marketing (puedes revocar este consentimiento en cualquier momento).</li>
          </ul>

          <h2>4. Conservación de los datos</h2>
          <p>
            Conservamos tus datos mientras tu cuenta esté activa. Si cancelas tu cuenta, eliminaremos o anonimizaremos
            tus datos personales en un plazo máximo de 30 días, salvo que debamos conservarlos por obligaciones legales
            (por ejemplo, datos de facturación durante 5 años).
          </p>

          <h2>5. Destinatarios y transferencias internacionales</h2>
          <p>Compartimos tus datos únicamente con los siguientes proveedores de confianza:</p>
          <ul>
            <li><strong>Supabase Inc.</strong> (infraestructura de base de datos y autenticación) — servidores en la UE.</li>
            <li><strong>Stripe Inc.</strong> (procesamiento de pagos) — con garantías adecuadas conforme al RGPD.</li>
            <li><strong>Vercel Inc.</strong> (alojamiento de la aplicación) — con garantías adecuadas conforme al RGPD.</li>
          </ul>
          <p>No vendemos ni cedemos tus datos a terceros para sus propios fines.</p>

          <h2>6. Tus derechos</h2>
          <p>Tienes derecho a:</p>
          <ul>
            <li><strong>Acceso:</strong> obtener confirmación de si tratamos tus datos y una copia de los mismos.</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
            <li><strong>Supresión ("derecho al olvido"):</strong> solicitar la eliminación de tus datos cuando ya no sean necesarios.</li>
            <li><strong>Oposición y limitación:</strong> oponerte a ciertos tratamientos o solicitar que los limitemos.</li>
            <li><strong>Portabilidad:</strong> recibir tus datos en un formato estructurado y legible por máquina.</li>
            <li><strong>Retirar el consentimiento</strong> en cualquier momento, sin que ello afecte a la licitud del tratamiento previo.</li>
          </ul>
          <p>
            Para ejercer estos derechos, escríbenos a{' '}
            <a href="mailto:privacidad@inclusia.es" className="text-primary">privacidad@inclusia.es</a>.
            También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) en{' '}
            <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-primary">www.aepd.es</a>.
          </p>

          <h2>7. Seguridad</h2>
          <p>
            Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos frente a accesos no autorizados,
            pérdida o destrucción, incluyendo cifrado en tránsito (HTTPS/TLS) y en reposo, autenticación segura y
            control de acceso basado en roles.
          </p>

          <h2>8. Cookies</h2>
          <p>
            Utilizamos únicamente cookies estrictamente necesarias para el funcionamiento de la sesión y la autenticación.
            No utilizamos cookies de seguimiento ni publicidad de terceros.
          </p>

          <h2>9. Cambios en esta política</h2>
          <p>
            Podemos actualizar esta Política de Privacidad periódicamente. Cuando lo hagamos, te notificaremos por email
            o mediante un aviso en la Plataforma. La fecha de "última actualización" al inicio de este documento
            siempre refleja la versión vigente.
          </p>

          <h2>10. Contacto</h2>
          <p>
            Para cualquier consulta sobre privacidad o protección de datos:{' '}
            <a href="mailto:privacidad@inclusia.es" className="text-primary">privacidad@inclusia.es</a>
          </p>
        </div>
      </div>
    </div>
  )
}
