<script>
    import Form from '../src/Form.svelte';
    import FormField from '../src/FormField.svelte';

    const onSubmit = (e, data) => {
        e.preventDefault();
        console.log(e, data);
    }
</script>

<main>
    <Form id="form" onSubmit={onSubmit}>

        <FormField type="text" label="firstname" name="firstname" validation={{
            mandatory: true,
            positiveRegex: {
            'No commas are allowed': /,/
            }
        }} />

        <FormField type="text" label="lastname" name="lastname" validation={{
            positiveRegex: {
            'No commas are allowed': /,/
            }
        }} />

        <FormField type="text" label="Favourite movie" name="favourites[]" />
        <FormField type="text" label="Favourite food" name="favourites[]" />

        <input type="submit" />
    </Form>
</main>
