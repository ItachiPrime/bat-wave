
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn(email, password);
    setLoading(false);
    navigate('/search');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signUp(email, password, fullName);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 bat-glow">
            <span className="text-primary-foreground font-bold text-2xl font-orbitron">B</span>
          </div>
          <h1 className="text-3xl font-bold font-orbitron uppercase tracking-wider text-primary mb-2">
            BAT-MUSIC
          </h1>
          <p className="text-muted-foreground font-orbitron text-sm">
            Enter the Dark Knight's music sanctuary
          </p>
        </div>

        <Card className="bg-card/90 backdrop-blur-sm border-border bat-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-center font-orbitron uppercase tracking-wider text-primary">
              ACCESS GRANTED
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-bat-grey">
                <TabsTrigger 
                  value="signin" 
                  className="font-orbitron uppercase text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  SIGN IN
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="font-orbitron uppercase text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  SIGN UP
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4 mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-bat-grey border-border focus:border-primary focus:bat-glow font-orbitron"
                  />
                  <Input
                    type="password"
                    placeholder="Password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-bat-grey border-border focus:border-primary focus:bat-glow font-orbitron"
                  />
                  <Button 
                    type="submit" 
                    className="w-full bat-glow hover:animate-glow-pulse font-orbitron uppercase tracking-wider"
                    disabled={loading}
                  >
                    {loading ? 'ACCESSING...' : 'ENTER GOTHAM'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Full name..."
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="bg-bat-grey border-border focus:border-primary focus:bat-glow font-orbitron"
                  />
                  <Input
                    type="email"
                    placeholder="Email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-bat-grey border-border focus:border-primary focus:bat-glow font-orbitron"
                  />
                  <Input
                    type="password"
                    placeholder="Password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-bat-grey border-border focus:border-primary focus:bat-glow font-orbitron"
                  />
                  <Button 
                    type="submit" 
                    className="w-full bat-glow hover:animate-glow-pulse font-orbitron uppercase tracking-wider"
                    disabled={loading}
                  >
                    {loading ? 'CREATING...' : 'JOIN THE LEAGUE'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
