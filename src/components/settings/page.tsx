"use client";

import AccountTab from "@/components/settings/AccountTab";
import PreferencesTab from "@/components/settings/PreferencesTab";
import ProfileTab from "@/components/settings/ProfileTab";

export default function SettingsPage() {
    return (
        <div className="space-y-6 p-4">
            <ProfileTab />
            <AccountTab />
            <PreferencesTab />
        </div>
    );
}