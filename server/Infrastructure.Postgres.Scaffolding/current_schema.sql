-- This schema is generated based on the current DBContext. Please check the class Seeder to see.
DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
        CREATE SCHEMA auth;
    END IF;
END $EF$;


CREATE TYPE auth.aal_level AS ENUM ('aal1', 'aal2', 'aal3');
DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
        CREATE SCHEMA auth;
    END IF;
END $EF$;


CREATE TYPE auth.code_challenge_method AS ENUM ('s256', 'plain');
DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
        CREATE SCHEMA auth;
    END IF;
END $EF$;


CREATE TYPE auth.factor_status AS ENUM ('unverified', 'verified');
DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
        CREATE SCHEMA auth;
    END IF;
END $EF$;


CREATE TYPE auth.factor_type AS ENUM ('totp', 'webauthn', 'phone');
DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
        CREATE SCHEMA auth;
    END IF;
END $EF$;


CREATE TYPE auth.oauth_authorization_status AS ENUM ('pending', 'approved', 'denied', 'expired');
DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
        CREATE SCHEMA auth;
    END IF;
END $EF$;


CREATE TYPE auth.oauth_client_type AS ENUM ('public', 'confidential');
DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
        CREATE SCHEMA auth;
    END IF;
END $EF$;


CREATE TYPE auth.oauth_registration_type AS ENUM ('dynamic', 'manual');
DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
        CREATE SCHEMA auth;
    END IF;
END $EF$;


CREATE TYPE auth.oauth_response_type AS ENUM ('code');
DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
        CREATE SCHEMA auth;
    END IF;
END $EF$;


CREATE TYPE auth.one_time_token_type AS ENUM ('confirmation_token', 'reauthentication_token', 'recovery_token', 'email_change_token_new', 'email_change_token_current', 'phone_change_token');
DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'realtime') THEN
        CREATE SCHEMA realtime;
    END IF;
END $EF$;


CREATE TYPE realtime.action AS ENUM ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'ERROR');
DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'realtime') THEN
        CREATE SCHEMA realtime;
    END IF;
END $EF$;


CREATE TYPE realtime.equality_op AS ENUM ('eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'in');
DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'storage') THEN
        CREATE SCHEMA storage;
    END IF;
END $EF$;


CREATE TYPE storage.buckettype AS ENUM ('STANDARD', 'ANALYTICS');
DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'extensions') THEN
        CREATE SCHEMA extensions;
    END IF;
END $EF$;


CREATE EXTENSION IF NOT EXISTS pg_stat_statements SCHEMA extensions;
DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'extensions') THEN
        CREATE SCHEMA extensions;
    END IF;
END $EF$;


CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;
DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'extensions') THEN
        CREATE SCHEMA extensions;
    END IF;
END $EF$;


CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'graphql') THEN
        CREATE SCHEMA graphql;
    END IF;
END $EF$;


CREATE EXTENSION IF NOT EXISTS pg_graphql SCHEMA graphql;
DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'vault') THEN
        CREATE SCHEMA vault;
    END IF;
END $EF$;


CREATE EXTENSION IF NOT EXISTS supabase_vault SCHEMA vault;


CREATE TABLE users (
    id uuid NOT NULL DEFAULT (gen_random_uuid()),
    email character varying(255) NOT NULL,
    passwordhash character varying(255) NOT NULL,
    salt text NOT NULL,
    firstname character varying(100) NOT NULL,
    lastname character varying(100) NOT NULL,
    phonenumber character varying(20),
    role character varying(20) NOT NULL,
    isactive boolean DEFAULT TRUE,
    profileimageurl character varying(500),
    language character varying(5) DEFAULT ('ua'::character varying),
    createdat timestamp without time zone DEFAULT (CURRENT_TIMESTAMP),
    updatedat timestamp without time zone DEFAULT (CURRENT_TIMESTAMP),
    lastloginat timestamp without time zone,
    mustchangepassword boolean DEFAULT FALSE,
    isdeleted boolean DEFAULT FALSE,
    CONSTRAINT users_pkey PRIMARY KEY (id)
);


CREATE TABLE projects (
    id uuid NOT NULL DEFAULT (gen_random_uuid()),
    clientid uuid NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    address character varying(300),
    city character varying(100),
    postalcode character varying(20),
    latitude numeric(10,8),
    longitude numeric(11,8),
    status character varying(50) NOT NULL DEFAULT ('InProgress'::character varying),
    startdate date NOT NULL,
    plannedenddate date,
    actualenddate date,
    totalarea numeric(10,2),
    budget numeric(15,2),
    progresspercentage integer DEFAULT 0,
    thumbnailurl character varying(500),
    createdat timestamp without time zone DEFAULT (CURRENT_TIMESTAMP),
    updatedat timestamp without time zone DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT projects_pkey PRIMARY KEY (id),
    CONSTRAINT projects_clientid_fkey FOREIGN KEY (clientid) REFERENCES users (id) ON DELETE CASCADE
);


CREATE TABLE refreshtokens (
    id uuid NOT NULL DEFAULT (gen_random_uuid()),
    userid uuid NOT NULL,
    token character varying(500) NOT NULL,
    expiresat timestamp without time zone NOT NULL,
    createdat timestamp without time zone DEFAULT (CURRENT_TIMESTAMP),
    revokedat timestamp without time zone,
    isrevoked boolean DEFAULT FALSE,
    CONSTRAINT refreshtokens_pkey PRIMARY KEY (id),
    CONSTRAINT refreshtokens_userid_fkey FOREIGN KEY (userid) REFERENCES users (id) ON DELETE CASCADE
);


CREATE TABLE documents (
    id uuid NOT NULL DEFAULT (gen_random_uuid()),
    projectid uuid NOT NULL,
    title character varying(200) NOT NULL,
    filename character varying(255) NOT NULL,
    fileurl character varying(500) NOT NULL,
    filesize bigint,
    mimetype character varying(100),
    documenttype character varying(50) NOT NULL,
    uploadedbyid uuid NOT NULL,
    isvisibletoclient boolean DEFAULT TRUE,
    createdat timestamp without time zone DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT documents_pkey PRIMARY KEY (id),
    CONSTRAINT documents_projectid_fkey FOREIGN KEY (projectid) REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT documents_uploadedbyid_fkey FOREIGN KEY (uploadedbyid) REFERENCES users (id)
);


CREATE TABLE messages (
    id uuid NOT NULL DEFAULT (gen_random_uuid()),
    projectid uuid NOT NULL,
    senderid uuid NOT NULL,
    receiverid uuid NOT NULL,
    content text NOT NULL,
    isread boolean DEFAULT FALSE,
    readat timestamptz,
    attachmenturl character varying(500),
    attachmenttype character varying(50),
    createdat timestamptz DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT messages_pkey PRIMARY KEY (id),
    CONSTRAINT messages_projectid_fkey FOREIGN KEY (projectid) REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT messages_receiverid_fkey FOREIGN KEY (receiverid) REFERENCES users (id),
    CONSTRAINT messages_senderid_fkey FOREIGN KEY (senderid) REFERENCES users (id)
);


CREATE TABLE milestones (
    id uuid NOT NULL DEFAULT (gen_random_uuid()),
    projectid uuid NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    orderindex integer NOT NULL,
    status character varying(50) NOT NULL DEFAULT ('Pending'::character varying),
    progresspercentage integer DEFAULT 0,
    plannedstartdate date,
    plannedenddate date,
    actualstartdate date,
    actualenddate date,
    notes text,
    createdat timestamp without time zone DEFAULT (CURRENT_TIMESTAMP),
    updatedat timestamp without time zone DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT milestones_pkey PRIMARY KEY (id),
    CONSTRAINT milestones_projectid_fkey FOREIGN KEY (projectid) REFERENCES projects (id) ON DELETE CASCADE
);


CREATE TABLE notifications (
    id uuid NOT NULL DEFAULT (gen_random_uuid()),
    userid uuid NOT NULL,
    projectid uuid,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    type character varying(50) NOT NULL,
    isread boolean DEFAULT FALSE,
    readat timestamp without time zone,
    actionurl character varying(500),
    createdat timestamp without time zone DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT notifications_pkey PRIMARY KEY (id),
    CONSTRAINT notifications_projectid_fkey FOREIGN KEY (projectid) REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT notifications_userid_fkey FOREIGN KEY (userid) REFERENCES users (id) ON DELETE CASCADE
);


CREATE TABLE photos (
    id uuid NOT NULL DEFAULT (gen_random_uuid()),
    projectid uuid NOT NULL,
    milestoneid uuid,
    filename character varying(255) NOT NULL,
    fileurl character varying(500) NOT NULL,
    thumbnailurl character varying(500),
    filesize bigint,
    mimetype character varying(100),
    width integer,
    height integer,
    caption text,
    takenat timestamp without time zone,
    uploadedbyid uuid NOT NULL,
    createdat timestamp without time zone DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT photos_pkey PRIMARY KEY (id),
    CONSTRAINT photos_milestoneid_fkey FOREIGN KEY (milestoneid) REFERENCES milestones (id) ON DELETE SET NULL,
    CONSTRAINT photos_projectid_fkey FOREIGN KEY (projectid) REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT photos_uploadedbyid_fkey FOREIGN KEY (uploadedbyid) REFERENCES users (id)
);


CREATE TABLE threedscans (
    id uuid NOT NULL DEFAULT (gen_random_uuid()),
    projectid uuid NOT NULL,
    milestoneid uuid,
    roomname character varying(100) NOT NULL,
    filename character varying(255) NOT NULL,
    fileurl character varying(500) NOT NULL,
    filesize bigint,
    fileformat character varying(50),
    roomarea numeric(10,2),
    scannedat timestamp without time zone,
    uploadedbyid uuid NOT NULL,
    notes text,
    createdat timestamp without time zone DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT threedscans_pkey PRIMARY KEY (id),
    CONSTRAINT threedscans_milestoneid_fkey FOREIGN KEY (milestoneid) REFERENCES milestones (id) ON DELETE SET NULL,
    CONSTRAINT threedscans_projectid_fkey FOREIGN KEY (projectid) REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT threedscans_uploadedbyid_fkey FOREIGN KEY (uploadedbyid) REFERENCES users (id)
);


CREATE TABLE updates (
    id uuid NOT NULL DEFAULT (gen_random_uuid()),
    projectid uuid NOT NULL,
    milestoneid uuid,
    updatetype character varying(50) NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    createdbyid uuid NOT NULL,
    createdat timestamp without time zone DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT updates_pkey PRIMARY KEY (id),
    CONSTRAINT updates_createdbyid_fkey FOREIGN KEY (createdbyid) REFERENCES users (id),
    CONSTRAINT updates_milestoneid_fkey FOREIGN KEY (milestoneid) REFERENCES milestones (id) ON DELETE SET NULL,
    CONSTRAINT updates_projectid_fkey FOREIGN KEY (projectid) REFERENCES projects (id) ON DELETE CASCADE
);


CREATE INDEX idx_documents_project ON documents (projectid);


CREATE INDEX idx_documents_type ON documents (documenttype);


CREATE INDEX idx_documents_visibility ON documents (projectid, isvisibletoclient);


CREATE INDEX "IX_documents_uploadedbyid" ON documents (uploadedbyid);


CREATE INDEX idx_messages_date ON messages (createdat DESC);


CREATE INDEX idx_messages_project ON messages (projectid);


CREATE INDEX idx_messages_receiver ON messages (receiverid);


CREATE INDEX idx_messages_sender ON messages (senderid);


CREATE INDEX idx_messages_unread ON messages (receiverid, isread) WHERE (isread = false);


CREATE INDEX idx_milestones_order ON milestones (projectid, orderindex);


CREATE INDEX idx_milestones_project ON milestones (projectid);


CREATE INDEX idx_milestones_status ON milestones (status);


CREATE UNIQUE INDEX unique_project_order ON milestones (projectid, orderindex);


CREATE INDEX idx_notifications_date ON notifications (createdat DESC);


CREATE INDEX idx_notifications_unread ON notifications (userid, isread) WHERE (isread = false);


CREATE INDEX idx_notifications_user ON notifications (userid);


CREATE INDEX "IX_notifications_projectid" ON notifications (projectid);


CREATE INDEX idx_photos_date ON photos (takenat DESC);


CREATE INDEX idx_photos_milestone ON photos (milestoneid);


CREATE INDEX idx_photos_project ON photos (projectid);


CREATE INDEX "IX_photos_uploadedbyid" ON photos (uploadedbyid);


CREATE INDEX idx_projects_client ON projects (clientid);


CREATE INDEX idx_projects_dates ON projects (startdate, plannedenddate);


CREATE INDEX idx_projects_status ON projects (status);


CREATE INDEX idx_refresh_tokens_active ON refreshtokens (userid, isrevoked) WHERE (isrevoked = false);


CREATE INDEX idx_refresh_tokens_token ON refreshtokens (token);


CREATE INDEX idx_refresh_tokens_user ON refreshtokens (userid);


CREATE UNIQUE INDEX refreshtokens_token_key ON refreshtokens (token);


CREATE INDEX idx_3dscans_milestone ON threedscans (milestoneid);


CREATE INDEX idx_3dscans_project ON threedscans (projectid);


CREATE INDEX "IX_threedscans_uploadedbyid" ON threedscans (uploadedbyid);


CREATE INDEX idx_updates_date ON updates (createdat DESC);


CREATE INDEX idx_updates_project ON updates (projectid);


CREATE INDEX idx_updates_type ON updates (updatetype);


CREATE INDEX "IX_updates_createdbyid" ON updates (createdbyid);


CREATE INDEX "IX_updates_milestoneid" ON updates (milestoneid);


CREATE INDEX idx_users_email ON users (email);


CREATE INDEX idx_users_role ON users (role);


CREATE UNIQUE INDEX users_email_key ON users (email);


