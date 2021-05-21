using Microsoft.EntityFrameworkCore.Migrations;

namespace Dockify.Model.Migrations
{
    public partial class AppTemplateModelUpdate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AlwaysPullImage",
                table: "DockerAppTemplates",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsProtected",
                table: "DockerAppTemplates",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AlwaysPullImage",
                table: "DockerAppTemplates");

            migrationBuilder.DropColumn(
                name: "IsProtected",
                table: "DockerAppTemplates");
        }
    }
}
