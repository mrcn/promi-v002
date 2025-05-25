import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Privacy Matters</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none space-y-6">
            
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Account Information</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Email address (for account creation and authentication)</li>
                  <li>Password (encrypted and securely stored)</li>
                </ul>

                <h3 className="text-lg font-medium">Content Processing</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>URLs you submit for content extraction</li>
                  <li>Images and text content from those URLs</li>
                  <li>AI-generated captions based on your content</li>
                </ul>

                <h3 className="text-lg font-medium">Instagram Integration (Optional)</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Instagram account ID and username (when you connect your account)</li>
                  <li>Access tokens for posting (stored securely)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Content Transformation:</strong> To extract images and generate Instagram captions from URLs you provide</li>
                <li><strong>Account Management:</strong> To provide you with secure access to our services</li>
                <li><strong>Service Improvement:</strong> To analyze usage patterns and improve our AI models</li>
                <li><strong>Instagram Posting:</strong> To post content to your Instagram account (only when you explicitly request it)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Data Storage and Security</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Secure Storage:</strong> All data is stored using Supabase with industry-standard encryption</li>
                <li><strong>Access Control:</strong> Your data is only accessible to you and necessary for service operation</li>
                <li><strong>Temporary Processing:</strong> URLs and content are processed temporarily and not permanently stored unless you save them</li>
                <li><strong>Token Security:</strong> Instagram access tokens are encrypted and stored securely</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Third-Party Services</h2>
              <div className="space-y-3">
                <h3 className="text-lg font-medium">AI Processing</h3>
                <p>We use OpenRouter and various AI models to generate captions. Content is processed according to their privacy policies and is not stored by these services.</p>
                
                <h3 className="text-lg font-medium">Instagram API</h3>
                <p>When you connect your Instagram account, we use Instagram's official API. We only access what you explicitly authorize.</p>
                
                <h3 className="text-lg font-medium">Supabase</h3>
                <p>Our backend infrastructure is provided by Supabase, which complies with GDPR and other privacy regulations.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Your Rights</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> You can view all your data through your account dashboard</li>
                <li><strong>Deletion:</strong> You can delete your account and all associated data at any time</li>
                <li><strong>Portability:</strong> You can export your generated captions and content</li>
                <li><strong>Disconnect:</strong> You can disconnect your Instagram account at any time</li>
                <li><strong>Opt-out:</strong> You can stop using our services at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Data Retention</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Data:</strong> Stored until you delete your account</li>
                <li><strong>Generated Content:</strong> Stored until you delete it or your account</li>
                <li><strong>Processing Logs:</strong> Automatically deleted after 30 days</li>
                <li><strong>Instagram Tokens:</strong> Stored until you disconnect your Instagram account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Cookies and Tracking</h2>
              <p>We use minimal cookies for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Authentication and session management</li>
                <li>Remembering your preferences</li>
                <li>Basic analytics to improve our service</li>
              </ul>
              <p className="mt-2">We do not use tracking cookies for advertising or sell your data to third parties.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Children's Privacy</h2>
              <p>Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Changes to This Policy</h2>
              <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Contact Us</h2>
              <p>If you have any questions about this privacy policy or our data practices, please contact us:</p>
              <div className="bg-gray-50 p-4 rounded-lg mt-3">
                <p><strong>Email:</strong> privacy@posttransformer.com</p>
                <p><strong>Response Time:</strong> We aim to respond within 48 hours</p>
              </div>
            </section>

            <div className="bg-blue-50 p-6 rounded-lg mt-8">
              <h3 className="text-lg font-semibold mb-2">Summary</h3>
              <p className="text-sm">
                We collect minimal data necessary to provide our service, use it only for content transformation and Instagram posting (with your permission), 
                store it securely, and give you full control over your data. We don't sell your information or use it for advertising.
              </p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;