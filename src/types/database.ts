export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    avatar_url: string | null
                    language: string | null
                    theme: string | null
                    goal: string | null
                    cefr_level: string | null
                    voiceup_score: number | null
                    speaking_score: number | null
                    listening_score: number | null
                    reading_score: number | null
                    writing_score: number | null
                    xp: number | null
                    streak_count: number | null
                    streak_freeze_available: boolean | null
                    last_active_date: string | null
                    interview_date: string | null
                    daily_goal_minutes: number | null
                    placement_done: boolean | null
                    nova_voice: string | null
                    reminder_enabled: boolean | null
                    reminder_time: string | null
                    generated_roadmap: string | null
                    earned_badges: string | null
                    description: string | null
                    created_at: string | null
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    avatar_url?: string | null
                    language?: string | null
                    theme?: string | null
                    goal?: string | null
                    cefr_level?: string | null
                    voiceup_score?: number | null
                    speaking_score?: number | null
                    listening_score?: number | null
                    reading_score?: number | null
                    writing_score?: number | null
                    xp?: number | null
                    streak_count?: number | null
                    streak_freeze_available?: boolean | null
                    last_active_date?: string | null
                    interview_date?: string | null
                    daily_goal_minutes?: number | null
                    placement_done?: boolean | null
                    nova_voice?: string | null
                    reminder_enabled?: boolean | null
                    reminder_time?: string | null
                    generated_roadmap?: string | null
                    earned_badges?: string | null
                    description?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    language?: string | null
                    theme?: string | null
                    goal?: string | null
                    cefr_level?: string | null
                    voiceup_score?: number | null
                    speaking_score?: number | null
                    listening_score?: number | null
                    reading_score?: number | null
                    writing_score?: number | null
                    xp?: number | null
                    streak_count?: number | null
                    streak_freeze_available?: boolean | null
                    last_active_date?: string | null
                    interview_date?: string | null
                    daily_goal_minutes?: number | null
                    placement_done?: boolean | null
                    nova_voice?: string | null
                    reminder_enabled?: boolean | null
                    reminder_time?: string | null
                    generated_roadmap?: string | null
                    earned_badges?: string | null
                    description?: string | null
                    created_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            sessions: {
                Row: {
                    id: string
                    user_id: string
                    skill: string | null
                    lesson_id: string | null
                    type: string | null
                    activity_type: string | null
                    mistakes_count: number | null
                    duration_seconds: number | null
                    score: number | null
                    xp_earned: number | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    skill?: string | null
                    lesson_id?: string | null
                    type?: string | null
                    mistakes_count?: number | null
                    duration_seconds?: number | null
                    score?: number | null
                    xp_earned?: number | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    skill?: string | null
                    lesson_id?: string | null
                    type?: string | null
                    mistakes_count?: number | null
                    duration_seconds?: number | null
                    score?: number | null
                    xp_earned?: number | null
                    created_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "sessions_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            mistakes: {
                Row: {
                    id: string
                    user_id: string
                    original_text: string | null
                    corrected_text: string | null
                    rule_explanation: string | null
                    practiced: boolean | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    original_text?: string | null
                    corrected_text?: string | null
                    rule_explanation?: string | null
                    practiced?: boolean | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    original_text?: string | null
                    corrected_text?: string | null
                    rule_explanation?: string | null
                    practiced?: boolean | null
                    created_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "mistakes_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            roadmap: {
                Row: {
                    id: string
                    user_id: string
                    day_number: number | null
                    title: string | null
                    skill: string | null
                    lesson_id: string | null
                    scheduled_date: string | null
                    completed: boolean | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    day_number?: number | null
                    title?: string | null
                    skill?: string | null
                    lesson_id?: string | null
                    scheduled_date?: string | null
                    completed?: boolean | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    day_number?: number | null
                    title?: string | null
                    skill?: string | null
                    lesson_id?: string | null
                    scheduled_date?: string | null
                    completed?: boolean | null
                    created_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "roadmap_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            challenges: {
                Row: {
                    id: string
                    user_id: string
                    challenge_date: string | null
                    challenge_type: string | null
                    score: number | null
                    duration_seconds: number | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    challenge_date?: string | null
                    challenge_type?: string | null
                    score?: number | null
                    duration_seconds?: number | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    challenge_date?: string | null
                    challenge_type?: string | null
                    score?: number | null
                    duration_seconds?: number | null
                    created_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "challenges_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            feedback: {
                Row: {
                    id: string
                    user_id: string
                    session_id: string | null
                    emoji_rating: number | null
                    text_feedback: string | null
                    nps_score: number | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    session_id?: string | null
                    emoji_rating?: number | null
                    text_feedback?: string | null
                    nps_score?: number | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    session_id?: string | null
                    emoji_rating?: number | null
                    text_feedback?: string | null
                    nps_score?: number | null
                    created_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "feedback_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "feedback_session_id_fkey"
                        columns: ["session_id"]
                        isOneToOne: false
                        referencedRelation: "sessions"
                        referencedColumns: ["id"]
                    }
                ]
            }
            certificates: {
                Row: {
                    id: string
                    user_id: string
                    certificate_type: string | null
                    cefr_level: string | null
                    verification_url: string | null
                    issued_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    certificate_type?: string | null
                    cefr_level?: string | null
                    verification_url?: string | null
                    issued_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    certificate_type?: string | null
                    cefr_level?: string | null
                    verification_url?: string | null
                    issued_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "certificates_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            badges: {
                Row: {
                    id: string
                    user_id: string
                    badge_type: string | null
                    earned_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    badge_type?: string | null
                    earned_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    badge_type?: string | null
                    earned_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "badges_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            increment_streak: {
                Args: {
                    p_user_id: string
                }
                Returns: undefined
            }
            reset_streak: {
                Args: {
                    p_user_id: string
                }
                Returns: undefined
            }
            add_xp: {
                Args: {
                    p_user_id: string
                    p_amount: number
                }
                Returns: undefined
            }
            update_scores: {
                Args: {
                    p_user_id: string
                    p_skill: string
                    p_new_score: number
                }
                Returns: undefined
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
