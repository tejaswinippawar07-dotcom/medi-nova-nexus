INSERT INTO public.user_roles (user_id, role)
VALUES ('d6935098-0e43-4681-bfef-2fba01f67467', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;