export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type EventType =
  | 'conference'
  | 'workshop'
  | 'concert'
  | 'webinar'
  | 'meetup'
  | 'wedding'
  | 'festival';

export type EventStatus =
  | 'draft'
  | 'scheduled'
  | 'published'
  | 'paused'
  | 'closed'
  | 'completed'
  | 'cancelled';

export type VenueType = 'physical' | 'online' | 'hybrid';

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'confirmed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export type TicketStatus = 'valid' | 'cancelled' | 'refunded' | 'transferred';

export type UserRole =
  | 'super_admin'
  | 'org_owner'
  | 'organizer'
  | 'co_organizer'
  | 'check_in_staff'
  | 'vendor'
  | 'attendee';

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          gstin: string | null;
          pan: string | null;
          plan: string;
          settings: Json;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          gstin?: string | null;
          pan?: string | null;
          plan?: string;
          settings?: Json;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          gstin?: string | null;
          pan?: string | null;
          plan?: string;
          settings?: Json;
          created_at?: string;
          deleted_at?: string | null;
        };
      };
      events: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          slug: string;
          description: string | null;
          event_type: EventType;
          start_date: string;
          end_date: string;
          timezone: string;
          venue_type: VenueType;
          venue_name: string | null;
          venue_city: string | null;
          venue_latitude: number | null;
          venue_longitude: number | null;
          capacity: number | null;
          is_free: boolean;
          currency: string;
          status: EventStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          slug: string;
          description?: string | null;
          event_type: EventType;
          start_date: string;
          end_date: string;
          timezone?: string;
          venue_type: VenueType;
          venue_name?: string | null;
          venue_city?: string | null;
          venue_latitude?: number | null;
          venue_longitude?: number | null;
          capacity?: number | null;
          is_free?: boolean;
          currency?: string;
          status?: EventStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          event_type?: EventType;
          start_date?: string;
          end_date?: string;
          timezone?: string;
          venue_type?: VenueType;
          venue_name?: string | null;
          venue_city?: string | null;
          venue_latitude?: number | null;
          venue_longitude?: number | null;
          capacity?: number | null;
          is_free?: boolean;
          currency?: string;
          status?: EventStatus;
          created_at?: string;
        };
      };
      ticket_types: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          price_cents: number;
          quantity: number;
          available_quantity: number;
          sold_quantity: number;
          min_per_order: number;
          max_per_order: number;
          sale_start: string | null;
          sale_end: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          price_cents: number;
          quantity: number;
          available_quantity: number;
          sold_quantity?: number;
          min_per_order?: number;
          max_per_order?: number;
          sale_start?: string | null;
          sale_end?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          price_cents?: number;
          quantity?: number;
          available_quantity?: number;
          sold_quantity?: number;
          min_per_order?: number;
          max_per_order?: number;
          sale_start?: string | null;
          sale_end?: string | null;
          is_active?: boolean;
        };
      };
      orders: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          order_number: string;
          status: OrderStatus;
          subtotal_cents: number;
          tax_cents: number;
          total_cents: number;
          billing_email: string;
          gstin: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          order_number: string;
          status?: OrderStatus;
          subtotal_cents: number;
          tax_cents?: number;
          total_cents: number;
          billing_email: string;
          gstin?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          order_number?: string;
          status?: OrderStatus;
          subtotal_cents?: number;
          tax_cents?: number;
          total_cents?: number;
          billing_email?: string;
          gstin?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          order_id: string;
          ticket_type_id: string;
          event_id: string;
          user_id: string;
          ticket_number: string;
          status: TicketStatus;
          attendee_name: string | null;
          attendee_email: string | null;
          qr_code: string;
          checked_in_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          ticket_type_id: string;
          event_id: string;
          user_id: string;
          ticket_number: string;
          status?: TicketStatus;
          attendee_name?: string | null;
          attendee_email?: string | null;
          qr_code: string;
          checked_in_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          ticket_type_id?: string;
          event_id?: string;
          user_id?: string;
          ticket_number?: string;
          status?: TicketStatus;
          attendee_name?: string | null;
          attendee_email?: string | null;
          qr_code?: string;
          checked_in_at?: string | null;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          amount_cents: number;
          status: PaymentStatus;
          gateway: string;
          gateway_order_id: string | null;
          gateway_payment_id: string | null;
          gateway_response: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          amount_cents: number;
          status?: PaymentStatus;
          gateway?: string;
          gateway_order_id?: string | null;
          gateway_payment_id?: string | null;
          gateway_response?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          amount_cents?: number;
          status?: PaymentStatus;
          gateway?: string;
          gateway_order_id?: string | null;
          gateway_payment_id?: string | null;
          gateway_response?: Json | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
