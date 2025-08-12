# Kalendermodul - Coworker CRM

## Översikt

Kalendermodulen är en fullständig kalenderfunktionalitet inspirerad av Plaan.se och Outlook-kalendern. Den låter användare skapa, redigera och hantera händelser med drag & drop-funktionalitet och en intuitiv användargränssnitt.

## Funktioner

### 🗓️ Kalendervy
- **Dag/Vecka/Månad-vy**: Växla mellan olika kalendervy
- **Tidsluckor**: 15-minuters intervall från 8:00 till 20:00
- **Responsiv design**: Fungerar på alla skärmstorlekar

### ✨ Händelsehantering
- **Skapa händelser**: Dubbelklicka i kalendern för att skapa nya händelser
- **Redigera händelser**: Klicka på befintliga händelser för att redigera
- **Ta bort händelser**: Ta bort händelser med bekräftelsedialog
- **Händelsetyper**: Möte, samtal, uppgift, anteckning, e-post

### 🎨 Anpassning
- **Färgkodning**: Automatisk färgkodning baserat på händelsetyp
- **Anpassade färger**: Välj från fördefinierade färger
- **Metadata**: Lagra extra information i händelser

### 🖱️ Drag & Drop
- **Flytta händelser**: Dra händelser mellan tidsluckor
- **Snap-to-grid**: Händelser snappar till 15-minuters intervall
- **Realtidsuppdatering**: Se ändringar direkt i kalendern

## Teknisk Implementation

### Komponenter

#### `Calendar.tsx`
Huvudkalenderkomponenten med:
- Tidsluckor och dagar
- Drag & drop-funktionalitet
- Dubbelklick för att skapa händelser
- Navigering mellan datum

#### `EventModal.tsx`
Modal för att skapa/redigera händelser med:
- Formulär för händelsedata
- Validering av indata
- Färgväljare
- Alla-dag-toggle

#### `CalendarPage.tsx`
Sida som integrerar alla komponenter med:
- Laddning av händelser
- Hantering av CRUD-operationer
- Statistik och översikt

### Databasintegration

Kalendermodulen använder den befintliga `activities`-tabellen:

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('note', 'email', 'call', 'meeting', 'task')),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_minutes INTEGER,
  outcome TEXT,
  next_action TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Kalenderservice

`CalendarService` hanterar alla CRUD-operationer:

- `getEvents(startDate, endDate)`: Hämta händelser för ett tidsintervall
- `createEvent(eventData)`: Skapa ny händelse
- `updateEvent(eventData)`: Uppdatera befintlig händelse
- `deleteEvent(eventId)`: Ta bort händelse
- `getEvent(eventId)`: Hämta specifik händelse

## Användning

### Installation

Kalendermodulen är redan integrerad i dashboard-layouten. Navigera till `/dashboard/calendar` för att använda den.

### Skapa en händelse

1. **Dubbelklicka** i kalendern på önskad tid och dag
2. Fyll i händelsens titel och beskrivning
3. Välj start- och sluttid
4. Välj händelsetyp och färg
5. Klicka "Skapa"

### Redigera en händelse

1. **Klicka** på befintlig händelse i kalendern
2. Ändra önskade fält
3. Klicka "Uppdatera"

### Flytta en händelse

1. **Klicka och håll** på händelsen
2. **Dra** till ny tid/dag
3. Släpp för att bekräfta

### Ta bort en händelse

1. Öppna händelsen för redigering
2. Klicka "Ta bort"
3. Bekräfta borttagning

## Anpassning

### Lägg till nya händelsetyper

1. Uppdatera `CalendarEvent` interface i `calendarService.ts`
2. Lägg till färg i `getEventColor()` metoden
3. Uppdatera `EventModal.tsx` med nya alternativ

### Ändra tidsluckor

Redigera `generateTimeSlots()` funktionen i `Calendar.tsx`:

```typescript
function generateTimeSlots(): Date[] {
  const slots = []
  const startHour = 6  // Ändra från 8 till 6
  const endHour = 22   // Ändra från 20 till 22
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) { // Ändra från 15 till 30
      const time = new Date()
      time.setHours(hour, minute, 0, 0)
      slots.push(time)
    }
  }
  
  return slots
}
```

### Anpassa färger

Uppdatera `getEventColor()` metoden i `CalendarService`:

```typescript
private static getEventColor(type: string): string {
  const colors: Record<string, string> = {
    meeting: '#FF6B6B',    // Ny röd färg
    call: '#4ECDC4',       // Ny grön färg
    task: '#45B7D1',       // Ny blå färg
    note: '#96CEB4',       // Ny grön färg
    email: '#FFEAA7'       // Ny gul färg
  }
  return colors[type] || '#6B7280'
}
```

## Felsökning

### Vanliga problem

#### Händelser visas inte
- Kontrollera att användaren är autentiserad
- Verifiera att `activities`-tabellen finns
- Kontrollera datumintervall i `getEvents()`

#### Drag & drop fungerar inte
- Kontrollera att `onMouseDown` eventet triggas
- Verifiera att `dragState` uppdateras korrekt
- Kontrollera event listeners i `useEffect`

#### Modal öppnas inte
- Verifiera att `isModalOpen` state uppdateras
- Kontrollera att `EventModal` komponenten renderas
- Verifiera att `onClose` funktionen fungerar

### Debug-läge

Aktivera debug-läge genom att lägga till console.log:

```typescript
// I Calendar.tsx
console.log('Drag state:', dragState)
console.log('Events:', events)

// I CalendarService.ts
console.log('Creating event:', eventData)
console.log('Database response:', data)
```

## Framtida förbättringar

### Planerade funktioner
- **Återkommande händelser**: Stöd för veckovisning och månadsvisning
- **Kalenderexport**: Export till iCal-format
- **Delning**: Dela kalendrar mellan användare
- **Påminnelser**: Push-notifikationer för händelser
- **Integration**: Koppling till externa kalendrar (Google, Outlook)

### Prestandaoptimering
- **Virtuell scrollning**: För stora antal händelser
- **Lazy loading**: Ladda händelser vid behov
- **Caching**: Implementera Redis-cache för händelser
- **WebSocket**: Realtidsuppdateringar för delade kalendrar

## Support

För tekniska frågor eller buggrapporter, kontakta utvecklingsteamet eller skapa en issue i projektets repository.

---

**Version**: 1.0.0  
**Senast uppdaterad**: 2024  
**Utvecklare**: Coworker CRM Team
