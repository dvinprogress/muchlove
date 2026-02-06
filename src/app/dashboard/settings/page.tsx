import { Header } from '@/components/dashboard'
import { Card, CardContent } from '@/components/ui'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div>
      <Header
        title="Paramètres"
        description="Gérez vos paramètres et préférences"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-rose-50 p-3 rounded-xl">
                <Settings className="w-6 h-6 text-rose-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Configuration du compte
                </h3>
                <p className="text-sm text-slate-500">
                  Gérez vos informations de compte et vos préférences
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-rose-50 p-3 rounded-xl">
                <Settings className="w-6 h-6 text-rose-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Plan et facturation
                </h3>
                <p className="text-sm text-slate-500">
                  Gérez votre abonnement et vos méthodes de paiement
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
