# Student Study Group Platform Backend API

Bu dokuman, calisma grubu platformu icin onerilen REST endpointlerini ve backend DTO sozlesmesini ozetler. Controller dosyalari su an servis/repository katmani baglanana kadar ornek response doner; amac frontend ve backend ekiplerinin ayni API contract uzerinden ilerlemesidir.

Base URL:

```text
/api
```

## Auth

| Method | Endpoint | DTO | Aciklama |
| --- | --- | --- | --- |
| POST | `/auth/register` | `RegisterRequest -> AuthResponse` | Yeni ogrenci hesabi olusturur. |
| POST | `/auth/login` | `LoginRequest -> AuthResponse` | Kullanici girisi yapar ve token doner. |

### RegisterRequest

```json
{
  "fullName": "Ada Lovelace",
  "email": "ada@university.edu",
  "password": "secret",
  "university": "Example University",
  "department": "Computer Engineering"
}
```

## Groups

| Method | Endpoint | DTO | Aciklama |
| --- | --- | --- | --- |
| GET | `/groups?subject=&search=` | `List<GroupResponse>` | Gruplari listeler ve filtreler. |
| POST | `/groups` | `CreateGroupRequest -> GroupResponse` | Calisma grubu olusturur. |
| GET | `/groups/{groupId}` | `GroupResponse` | Grup detayini getirir. |
| PUT | `/groups/{groupId}` | `UpdateGroupRequest -> GroupResponse` | Grup bilgilerini gunceller. |
| DELETE | `/groups/{groupId}` | `204 No Content` | Grubu siler. |
| POST | `/groups/{groupId}/join` | `GroupMemberResponse` | Giris yapan kullaniciyi gruba ekler. |
| DELETE | `/groups/{groupId}/leave` | `204 No Content` | Giris yapan kullaniciyi gruptan cikarir. |
| GET | `/groups/{groupId}/members` | `List<GroupMemberResponse>` | Grup uyelerini listeler. |

### CreateGroupRequest

```json
{
  "name": "Cloud Computing Final Prep",
  "description": "Final sinavi icin ortak calisma grubu.",
  "courseCode": "CSE401",
  "subject": "Cloud Computing",
  "visibility": "PUBLIC",
  "maxMembers": 12,
  "tags": ["aws", "docker", "distributed-systems"]
}
```

## Online Study Sessions

| Method | Endpoint | DTO | Aciklama |
| --- | --- | --- | --- |
| GET | `/groups/{groupId}/sessions` | `List<StudySessionResponse>` | Grubun oturumlarini listeler. |
| POST | `/groups/{groupId}/sessions` | `CreateStudySessionRequest -> StudySessionResponse` | Online calisma oturumu planlar. |
| GET | `/groups/{groupId}/sessions/{sessionId}` | `StudySessionResponse` | Oturum detayini getirir. |
| PUT | `/groups/{groupId}/sessions/{sessionId}` | `UpdateStudySessionRequest -> StudySessionResponse` | Oturumu gunceller. |
| DELETE | `/groups/{groupId}/sessions/{sessionId}` | `204 No Content` | Oturumu iptal eder. |
| POST | `/groups/{groupId}/sessions/{sessionId}/attendees` | `StudySessionResponse` | Oturuma katilir. |
| DELETE | `/groups/{groupId}/sessions/{sessionId}/attendees/me` | `204 No Content` | Oturumdan ayrilir. |

## Messaging

| Method | Endpoint | DTO | Aciklama |
| --- | --- | --- | --- |
| GET | `/groups/{groupId}/messages?beforeMessageId=&limit=30` | `List<MessageResponse>` | Grup mesajlarini sayfali getirir. |
| POST | `/groups/{groupId}/messages` | `SendMessageRequest -> MessageResponse` | Yeni mesaj gonderir. |

Gercek zamanli mesajlasma icin sonraki adimda REST endpointlerine ek olarak WebSocket kanali onerilir:

```text
/ws/groups/{groupId}/messages
```

## Shared Notes And Tasks

| Method | Endpoint | DTO | Aciklama |
| --- | --- | --- | --- |
| GET | `/groups/{groupId}/workspace/notes` | `List<NoteResponse>` | Ortak notlari listeler. |
| POST | `/groups/{groupId}/workspace/notes` | `UpsertNoteRequest -> NoteResponse` | Not olusturur. |
| PUT | `/groups/{groupId}/workspace/notes/{noteId}` | `UpsertNoteRequest -> NoteResponse` | Notu gunceller. |
| DELETE | `/groups/{groupId}/workspace/notes/{noteId}` | `204 No Content` | Notu siler. |
| GET | `/groups/{groupId}/workspace/tasks` | `List<TaskResponse>` | Gorevleri listeler. |
| POST | `/groups/{groupId}/workspace/tasks` | `CreateTaskRequest -> TaskResponse` | Gorev olusturur. |
| PUT | `/groups/{groupId}/workspace/tasks/{taskId}` | `UpdateTaskRequest -> TaskResponse` | Gorevi gunceller. |
| DELETE | `/groups/{groupId}/workspace/tasks/{taskId}` | `204 No Content` | Gorevi siler. |

## Materials

| Method | Endpoint | DTO | Aciklama |
| --- | --- | --- | --- |
| GET | `/groups/{groupId}/materials` | `List<MaterialResponse>` | Paylasilan materyalleri listeler. |
| POST | `/groups/{groupId}/materials` | `CreateMaterialRequest -> MaterialResponse` | Link veya dosya metadata kaydi olusturur. |
| DELETE | `/groups/{groupId}/materials/{materialId}` | `204 No Content` | Materyali siler. |

Dosya upload eklenecekse `multipart/form-data` kullanan ek bir endpoint onerilir:

```text
POST /api/groups/{groupId}/materials/upload
```

## Pomodoro

| Method | Endpoint | DTO | Aciklama |
| --- | --- | --- | --- |
| GET | `/groups/{groupId}/pomodoros` | `List<PomodoroSessionResponse>` | Grup Pomodoro gecmisini veya aktif timerlari listeler. |
| POST | `/groups/{groupId}/pomodoros` | `StartPomodoroRequest -> PomodoroSessionResponse` | Pomodoro timer baslatir. |
| PATCH | `/groups/{groupId}/pomodoros/{pomodoroId}/status` | `UpdatePomodoroStatusRequest -> PomodoroSessionResponse` | Timer durumunu RUNNING, PAUSED, COMPLETED veya CANCELLED yapar. |

### StartPomodoroRequest

```json
{
  "focusMinutes": 25,
  "shortBreakMinutes": 5,
  "longBreakMinutes": 15,
  "cycleCount": 4,
  "taskId": 1
}
```

## DTO Dosyalari

DTO contract dosyalari:

- `src/main/java/com/school_project/api/dto/AuthDtos.java`
- `src/main/java/com/school_project/api/dto/GroupDtos.java`
- `src/main/java/com/school_project/api/dto/StudySessionDtos.java`
- `src/main/java/com/school_project/api/dto/MessageDtos.java`
- `src/main/java/com/school_project/api/dto/WorkspaceDtos.java`
- `src/main/java/com/school_project/api/dto/MaterialDtos.java`
- `src/main/java/com/school_project/api/dto/PomodoroDtos.java`

## Entity Modeli

Bu projede entity katmani gereklidir, cunku grup uyelikleri, oturumlar, mesajlar, ortak notlar, gorevler, materyaller ve Pomodoro gecmisi veritabaninda tutulmalidir. DTO'lar dis API sozlesmesini, entity'ler ise veritabani modelini temsil eder.

Eklenen entity dosyalari:

| Entity | Tablo | Amac |
| --- | --- | --- |
| `StudentUser` | `student_users` | Ogrenci hesap bilgileri. |
| `StudyGroup` | `study_groups` | Ders/konu bazli calisma gruplari. |
| `GroupMember` | `group_members` | Kullanici-grup uyeligi ve rol bilgisi. |
| `StudySession` | `study_sessions` | Planlanan veya canli online calisma oturumlari. |
| `SessionAttendee` | `session_attendees` | Oturum katilimcilari. |
| `ChatMessage` | `chat_messages` | Grup ici mesajlar. |
| `WorkspaceNote` | `workspace_notes` | Ortak not alani. |
| `WorkspaceTask` | `workspace_tasks` | Grup gorevleri ve durum takibi. |
| `StudyMaterial` | `study_materials` | Paylasilan link/dosya metadata kayitlari. |
| `PomodoroSession` | `pomodoro_sessions` | Odak timer kayitlari. |

Ortak alanlar `BaseEntity` icinde tutulur:

- `id`
- `createdAt`
- `updatedAt`

JPA entity'leri icin `spring-boot-starter-data-jpa` bagimliligi da `pom.xml` dosyasina eklenmistir.

## Sonraki Backend Adimlari

1. `repository` ve `service` katmanlarini ekleyip controller mock response'larini servis cagrilarina baglayin.
2. Request DTO'lara Bean Validation ekleyin: `@NotBlank`, `@Email`, `@Min`, `@Future`.
3. Auth icin JWT veya session tabanli Spring Security akisi kurun.
4. Messaging icin WebSocket/STOMP veya Socket.IO muadili bir kanal ekleyin.
5. Material upload icin object storage entegrasyonu ekleyin: S3, MinIO veya cloud provider storage.
