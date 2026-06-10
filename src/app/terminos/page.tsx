import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TerminosPage() {
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
          <h1 className="text-3xl font-bold mb-2">Términos de uso</h1>
          <p className="text-muted-foreground text-sm mb-8">Última actualización: junio de 2025</p>

          <h2>1. Objeto y ámbito de aplicación</h2>
          <p>
            Los presentes Términos de Uso regulan el acceso y la utilización de la plataforma <strong>Inclusia</strong>
            (en adelante, "la Plataforma"), titularidad de Inclusia, con domicilio en España, y accesible a través de internet.
            Al registrarte o utilizar la Plataforma, aceptas estos Términos en su totalidad.
          </p>

          <h2>2. Descripción del servicio</h2>
          <p>
            Inclusia es una plataforma digital que conecta a centros educativos y entidades del sector de la educación
            especial ("Centros") con profesionales del apoyo educativo ("Profesionales"). La Plataforma facilita la
            publicación de ofertas de trabajo, la recepción de candidaturas, y la comunicación entre ambas partes.
          </p>

          <h2>3. Registro y cuenta de usuario</h2>
          <p>
            Para acceder a las funcionalidades de la Plataforma es necesario crear una cuenta. Te comprometes a
            proporcionar información veraz, actualizada y completa durante el registro y a mantenerla actualizada.
            Eres responsable de mantener la confidencialidad de tus credenciales de acceso.
          </p>
          <p>
            Existen dos tipos de cuentas: <strong>Profesional</strong> y <strong>Centro/Entidad</strong>.
            Cada tipo tiene acceso a funcionalidades diferenciadas según se describe en la Plataforma.
          </p>

          <h2>4. Uso permitido</h2>
          <p>Te comprometes a utilizar la Plataforma únicamente para los fines previstos y, en particular, a no:</p>
          <ul>
            <li>Publicar información falsa, engañosa o fraudulenta.</li>
            <li>Utilizar la Plataforma para actividades ilegales o contrarias a la buena fe.</li>
            <li>Intentar acceder a cuentas de otros usuarios sin autorización.</li>
            <li>Realizar scraping, extracción masiva de datos u otras técnicas automatizadas sin consentimiento previo.</li>
            <li>Enviar comunicaciones no solicitadas (spam) a través del sistema de mensajería.</li>
          </ul>

          <h2>5. Suscripciones y pagos</h2>
          <p>
            Inclusia ofrece planes de suscripción de pago con funcionalidades adicionales. Los precios y condiciones
            de cada plan están disponibles en la sección de suscripción de la Plataforma. El procesamiento de pagos
            se realiza a través de <strong>Stripe</strong>, proveedor externo de servicios de pago. Al suscribirte
            a un plan de pago, autorizas el cargo recurrente en tu método de pago.
          </p>
          <p>
            Puedes cancelar tu suscripción en cualquier momento contactando con soporte. No se realizan reembolsos
            por períodos ya facturados, salvo que la ley aplicable lo exija.
          </p>

          <h2>6. Propiedad intelectual</h2>
          <p>
            Todos los contenidos, diseños, logotipos y software de la Plataforma son propiedad de Inclusia o sus
            licenciantes y están protegidos por las leyes de propiedad intelectual. No se concede ninguna licencia
            sobre dichos contenidos más allá del uso personal y no comercial necesario para utilizar la Plataforma.
          </p>

          <h2>7. Limitación de responsabilidad</h2>
          <p>
            Inclusia actúa como intermediario tecnológico y no es parte en las relaciones laborales o contractuales
            que puedan surgir entre Centros y Profesionales. No garantizamos la exactitud de los perfiles ni el
            resultado de los procesos de selección. En la medida permitida por la ley, la responsabilidad de Inclusia
            queda limitada al importe abonado por el usuario en los 12 meses anteriores al hecho generador.
          </p>

          <h2>8. Modificación y terminación</h2>
          <p>
            Nos reservamos el derecho de modificar estos Términos en cualquier momento. Te notificaremos los cambios
            relevantes por email o a través de la Plataforma. El uso continuado de la Plataforma tras la notificación
            implica la aceptación de los nuevos Términos.
          </p>
          <p>
            Podemos suspender o cancelar tu cuenta si incumples estos Términos, previa notificación salvo en casos
            de incumplimiento grave.
          </p>

          <h2>9. Ley aplicable y jurisdicción</h2>
          <p>
            Estos Términos se rigen por la legislación española. Para cualquier controversia, ambas partes se someten
            a los juzgados y tribunales de España, sin perjuicio de los fueros imperativos que pudieran corresponder
            a los consumidores.
          </p>

          <h2>10. Contacto</h2>
          <p>
            Para cualquier consulta sobre estos Términos puedes contactarnos en{' '}
            <a href="mailto:soporte@inclusia.es" className="text-primary">soporte@inclusia.es</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
