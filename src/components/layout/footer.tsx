import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">I</span>
              </div>
              <span className="font-bold text-xl text-primary">Inclusia</span>
            </div>
            <p className="text-sm text-muted-foreground">
              La red de respuesta rápida para cubrir apoyos educativos en centros y entidades.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Profesionales</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/auth/registro?rol=profesional" className="hover:text-foreground">Crear perfil</Link></li>
              <li><Link href="/ofertas" className="hover:text-foreground">Ver ofertas</Link></li>
              <li><Link href="/precios#profesionales" className="hover:text-foreground">Plan Premium</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Empresas</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/auth/registro?rol=empresa" className="hover:text-foreground">Publicar oferta</Link></li>
              <li><Link href="/profesionales" className="hover:text-foreground">Buscar profesionales</Link></li>
              <li><Link href="/precios#empresas" className="hover:text-foreground">Ver planes</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacidad" className="hover:text-foreground">Privacidad</Link></li>
              <li><Link href="/terminos" className="hover:text-foreground">Términos de uso</Link></li>
              <li><Link href="/cookies" className="hover:text-foreground">Cookies</Link></li>
              <li><Link href="/contacto" className="hover:text-foreground">Contacto</Link></li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025 Inclusia. Todos los derechos reservados.</p>
          <p>Hecho con cariño para la educación inclusiva</p>
        </div>
      </div>
    </footer>
  )
}
