import { Clock, Github, MessageSquare, Send, Twitter } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  

  

  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  

  


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mapping des valeurs courtes vers les textes complets
    const subjectMapping: Record<string, string> = {
      'bug': 'Signaler un bug',
      'feature': 'Demande de fonctionnalité',
      'help': 'Demande d\'aide',
      'feedback': 'Commentaires généraux',
      'partnership': 'Partenariat',
      'other': 'Autre'
    };
    
    // Créer le sujet complet avec le préfixe
    const fullSubject = `Cubic Art - ${subjectMapping[formData.subject] || formData.subject}`;
    
    // Créer le corps de l'email avec le nom complet, l'email et le message
    const emailBody = `Nom complet: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;
    
    // Créer le lien mailto avec le sujet complet
    const mailtoLink = `mailto:baptistelechat@outlook.fr?subject=${encodeURIComponent(fullSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Ouvrir le client email
    window.location.href = mailtoLink;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Contactez-nous
          </h1>
          <p className="text-xl text-gray-600 mx-auto">
            Une question, une suggestion ou un problème ? Nous sommes là pour vous aider !
          </p>
        </div>
        
        {/* Additional Information - Moved here */}
        <div className="mb-12 bg-gray-100 rounded-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Avant de nous contacter
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Vérifiez la FAQ</h4>
              <p className="text-gray-600 text-sm">
                La plupart des questions courantes ont déjà une réponse dans notre <Link to="/about" className="text-blue-600 hover:text-blue-800 underline font-medium">FAQ</Link>.
              </p>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Consultez GitHub</h4>
              <p className="text-gray-600 text-sm">
                Pour les bugs et demandes de fonctionnalités, vérifiez d'abord les issues existantes.
              </p>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Soyez précis</h4>
              <p className="text-gray-600 text-sm">
                Plus votre description est détaillée, plus nous pourrons vous aider efficacement.
              </p>
            </div>
          </div>
        </div>
        

        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2" id="contact-form">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <MessageSquare className="text-blue-600" size={28} />
                  <h2 className="text-2xl font-bold text-gray-900">Envoyez-nous un message</h2>
                </div>
              </CardHeader>
              

              
              <CardContent className="flex-1">
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 space-y-6 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">
                      Nom complet *
                    </Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="h-12"
                      placeholder="Votre nom"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">
                      Email *
                    </Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-12"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-gray-700">
                    Sujet *
                  </Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                    required
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Sélectionnez un sujet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">Signaler un bug</SelectItem>
                      <SelectItem value="feature">Demande de fonctionnalité</SelectItem>
                      <SelectItem value="help">Demande d'aide</SelectItem>
                      <SelectItem value="feedback">Commentaires généraux</SelectItem>
                      <SelectItem value="partnership">Partenariat</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 flex flex-col space-y-2">
                  <Label htmlFor="message" className="text-gray-700">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="flex-1 resize-none min-h-[300px]"
                    placeholder="Décrivez votre demande en détail..."
                  />
                </div>
                </form>
              </CardContent>
              
              <div className="p-6 pt-0">
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12"
                  size="lg"
                >
                  <Send size={20} className="mr-2" />
                  <span>Envoyer le message</span>
                </Button>
              </div>
            </Card>
          </div>
          
          {/* Contact Information */}
          <div className="space-y-6 h-full flex flex-col">
            {/* Contact Methods */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold text-gray-900">Suivez-moi sur les réseaux</h3>
              </CardHeader>
              <CardContent>
              
              <div className="space-y-4 text-left">
                <a
                  href="https://x.com/baptiste_lechat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Twitter className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Twitter / X</p>
                    <p className="text-sm text-gray-600">@baptiste_lechat</p>
                  </div>
                </a>
                
                <a
                  href="https://github.com/baptistelechat/cubic-art"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <Github className="text-gray-700" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">GitHub</p>
                    <p className="text-sm text-gray-600">Signaler un problème</p>
                  </div>
                </a>
              </div>
              </CardContent>
            </Card>
            
            {/* Response Time */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Clock className="text-green-600" size={24} />
                  <h3 className="text-xl font-bold text-gray-900">Temps de réponse</h3>
                </div>
              </CardHeader>
              <CardContent>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bugs critiques</span>
                  <span className="font-medium text-red-600">&lt; 24h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Questions générales</span>
                  <span className="font-medium text-blue-600">1-3 jours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Demandes de fonctionnalités</span>
                  <span className="font-medium text-green-600">1 semaine</span>
                </div>
              </div>
              </CardContent>
            </Card>
            
            {/* FAQ Link */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-3">Questions fréquentes</h3>
              <p className="text-blue-100 mb-4 text-sm">
                Consultez notre FAQ pour trouver des réponses rapides aux questions les plus courantes.
              </p>
              <Link to="/about" className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm inline-block">
                Voir la FAQ
              </Link>
            </div>
            

          </div>
        </div>
      </div>
    </div>
  );
}