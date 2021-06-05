CREATE TABLE endpoints (
   id serial PRIMARY KEY,
   created_at timestamp NOT NULL,
   name varchar(60) NOT NULL
);

CREATE TABLE requests (
   id serial PRIMARY KEY,
   endpoint_id int NOT NULL,
   FOREIGN KEY (endpoint_id) REFERENCES endpoints(id) ON DELETE CASCADE,
   content jsonb NOT NULL DEFAULT '{}'::jsonb,
   created_at timestamp NOT NULL
);
