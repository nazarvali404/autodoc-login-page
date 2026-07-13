'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const [profileName, setProfileName] = useState('Admin Demo');
  const [profileEmail, setProfileEmail] = useState('admindemo@gmail.com');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure profile details, general rules, and platform preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-secondary/40 p-1 rounded-xl">
          <TabsTrigger value="profile" className="rounded-lg">Profile</TabsTrigger>
          <TabsTrigger value="general" className="rounded-lg">General</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg">Notifications</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="border-border/80 rounded-2xl">
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Manage your name, email, and public details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="prof-name">Full Name</Label>
                  <Input id="prof-name" value={profileName} onChange={e => setProfileName(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prof-email">Email Address</Label>
                  <Input id="prof-email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} className="rounded-xl" />
                </div>
              </div>
              <Button className="rounded-xl">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card className="border-border/80 rounded-2xl">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure localization preferences and company detail defaults.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="workspace-name">Workspace Name</Label>
                  <Input id="workspace-name" defaultValue="MyWorkspace" className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="timezone">Default Timezone</Label>
                  <Input id="timezone" defaultValue="Asia/Kolkata (IST)" className="rounded-xl" />
                </div>
              </div>
              <Button className="rounded-xl">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="border-border/80 rounded-2xl">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose how and when you receive compliance updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Checkbox id="email-notif" defaultChecked />
                  <Label htmlFor="email-notif">Email Notifications</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="sms-notif" />
                  <Label htmlFor="sms-notif">SMS Notifications</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="app-notif" defaultChecked />
                  <Label htmlFor="app-notif">In-App Alerts & Activity Log</Label>
                </div>
              </div>
              <Separator />
              <Button className="rounded-xl">Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="border-border/80 rounded-2xl">
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
              <CardDescription>Change passwords and enable two-factor security parameters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 max-w-sm">
                <div className="space-y-1.5">
                  <Label htmlFor="curr-pass">Current Password</Label>
                  <Input id="curr-pass" type="password" placeholder="••••••••" className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-pass">New Password</Label>
                  <Input id="new-pass" type="password" placeholder="••••••••" className="rounded-xl" />
                </div>
              </div>
              <Button className="rounded-xl">Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
