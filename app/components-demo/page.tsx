import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ComponentsDemo() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Component Showcase</h1>
        <p className="text-muted-foreground">
          All Shadcn/ui components styled for the dark fintech theme
        </p>
      </div>

      <div className="space-y-12">
        {/* Buttons */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardDescription>Different button styles</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Button Sizes</CardTitle>
                <CardDescription>Different button sizes</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">🎯</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Standard Card</CardTitle>
                <CardDescription>With header and content</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is a standard card with glassmorphism effect.
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>Glass Effect</CardTitle>
                <CardDescription>Subtle glass styling</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Using the .glass utility class.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle>Accent Card</CardTitle>
                <CardDescription>With primary accent</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Custom styling with primary color.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Form Elements */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Form Elements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Input Fields</CardTitle>
                <CardDescription>Text inputs with labels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text-input">Text Input</Label>
                  <Input id="text-input" placeholder="Enter text..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-input">Email Input</Label>
                  <Input id="email-input" type="email" placeholder="email@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number-input">Number Input</Label>
                  <Input id="number-input" type="number" placeholder="1000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="disabled-input">Disabled Input</Label>
                  <Input id="disabled-input" placeholder="Disabled" disabled />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Select Dropdown</CardTitle>
                <CardDescription>Dropdown selection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="select-1">Point Type</Label>
                  <Select defaultValue="aeroplan">
                    <SelectTrigger id="select-1">
                      <SelectValue placeholder="Select point type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aeroplan">Aeroplan</SelectItem>
                      <SelectItem value="avion">Avion</SelectItem>
                      <SelectItem value="membership-rewards">Membership Rewards</SelectItem>
                      <SelectItem value="cashback">Cashback</SelectItem>
                      <SelectItem value="scene-plus">Scene+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="select-2">Card Network</Label>
                  <Select>
                    <SelectTrigger id="select-2">
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visa">Visa</SelectItem>
                      <SelectItem value="mastercard">Mastercard</SelectItem>
                      <SelectItem value="amex">American Express</SelectItem>
                      <SelectItem value="discover">Discover</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Sliders and Progress */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Sliders & Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Sliders</CardTitle>
                <CardDescription>Range input controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Grocery Spending</Label>
                    <span className="text-sm text-muted-foreground">$1,200</span>
                  </div>
                  <Slider defaultValue={[1200]} max={3000} step={50} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Gas Spending</Label>
                    <span className="text-sm text-muted-foreground">$300</span>
                  </div>
                  <Slider defaultValue={[300]} max={1000} step={25} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Dining Spending</Label>
                    <span className="text-sm text-muted-foreground">$600</span>
                  </div>
                  <Slider defaultValue={[600]} max={2000} step={50} />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Progress Bars</CardTitle>
                <CardDescription>Visual progress indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Label>Goal Progress</Label>
                    <span className="text-muted-foreground">25%</span>
                  </div>
                  <Progress value={25} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Label>Bonus Completion</Label>
                    <span className="text-muted-foreground">50%</span>
                  </div>
                  <Progress value={50} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Label>Points Earned</Label>
                    <span className="text-muted-foreground">75%</span>
                  </div>
                  <Progress value={75} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Label>Complete</Label>
                    <span className="text-muted-foreground">100%</span>
                  </div>
                  <Progress value={100} />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Typography</h2>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Text Styles</CardTitle>
              <CardDescription>Typography hierarchy and colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold">Heading 1</h1>
                <p className="text-sm text-muted-foreground">text-4xl font-bold</p>
              </div>
              <div>
                <h2 className="text-3xl font-bold">Heading 2</h2>
                <p className="text-sm text-muted-foreground">text-3xl font-bold</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Heading 3</h3>
                <p className="text-sm text-muted-foreground">text-2xl font-bold</p>
              </div>
              <div>
                <p className="text-base">Body text - Regular paragraph text</p>
                <p className="text-sm text-muted-foreground">text-base</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Muted text - Secondary information</p>
                <p className="text-sm text-muted-foreground">text-sm text-muted-foreground</p>
              </div>
              <div>
                <p className="text-gradient text-2xl font-bold">Gradient Text</p>
                <p className="text-sm text-muted-foreground">text-gradient</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Colors */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Color Palette</h2>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Theme Colors</CardTitle>
              <CardDescription>Primary color system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-primary" />
                  <p className="text-sm font-medium">Primary</p>
                  <p className="text-xs text-muted-foreground">Electric Blue</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-secondary" />
                  <p className="text-sm font-medium">Secondary</p>
                  <p className="text-xs text-muted-foreground">Muted Blue</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-accent" />
                  <p className="text-sm font-medium">Accent</p>
                  <p className="text-xs text-muted-foreground">Hover State</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-destructive" />
                  <p className="text-sm font-medium">Destructive</p>
                  <p className="text-xs text-muted-foreground">Error Red</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
