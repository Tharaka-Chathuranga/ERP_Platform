UPDATE store.items i
SET locations = i.locations || jsonb_build_array(
        jsonb_build_object(
            'rack', NULL,
            'row', NULL,
            'column', NULL,
            'primary', false,
            'general', true,
            'quantity', diff.remainder
        )
    )
FROM (
    SELECT id,
           quantity_on_hand - COALESCE((
               SELECT SUM((elem ->> 'quantity')::numeric)
               FROM jsonb_array_elements(locations) AS elem
           ), 0) AS remainder
    FROM store.items
) AS diff
WHERE i.id = diff.id
  AND diff.remainder > 0
  AND NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(i.locations) AS g
      WHERE COALESCE((g ->> 'general')::boolean, false) IS TRUE
  );
