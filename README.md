# subql-templates

A template registry for subquery projects. Generate a project template from a handlebars file and vice versa

## Adding a template

In order for a template to be used by the public it must be added to this repository.

1. First setup your template project using the [variables](#variables) below in handlebars format.
2. Generate a handlebars file for your template project using `@subql/cli`, executing `subql generate-template`
3. Fork this repository and add your handlebars file to the repository root
4. Extend [templates.ts](./templates.ts) by adding the handlebars file basename and description of the template
5. Create a pull request featuring your changes to this repository and the subquery team will merge

## Variables

| Variable              | Description           |
| --------------------- | --------------------- |
| {{subql_name}}        | Project name          |
| {{subql_author}}      | Project author        |
| {{subql_description}} | Project description   |
| {{subql_version}}     | Project version       |
| {{subql_license}}     | Project license       |
| {{subql_repository}}  | Project github remote |
| {{subql_endpoint}}    | Project RPC endpoint  |
