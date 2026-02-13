-- Create a function to check if a table exists and return its info
CREATE OR REPLACE FUNCTION public.get_table_info(table_name text)
RETURNS json AS $$
DECLARE
    table_info json;
    table_exists boolean;
BEGIN
    -- Check if table exists in the schema
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = get_table_info.table_name
    ) INTO table_exists;

    IF NOT table_exists THEN
        RETURN json_build_object(
            'exists', false,
            'message', format('Table %I does not exist in the public schema', table_name)
        );
    END IF;

    -- Get table info if it exists
    SELECT json_build_object(
        'exists', true,
        'columns', (
            SELECT json_agg(
                json_build_object(
                    'column_name', column_name,
                    'data_type', udt_name,
                    'is_nullable', is_nullable = 'YES',
                    'column_default', column_default
                )
            )
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = get_table_info.table_name
        ),
        'constraints', (
            SELECT json_agg(
                json_build_object(
                    'constraint_name', conname,
                    'constraint_type', contype,
                    'constraint_definition', pg_get_constraintdef(oid)
                )
            )
            FROM pg_constraint 
            WHERE conrelid = ('public.' || get_table_info.table_name)::regclass
        )
    ) INTO table_info;

    RETURN table_info;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_table_info(text) TO authenticated;
