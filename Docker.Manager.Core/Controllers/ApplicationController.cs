using Arch.EntityFrameworkCore.UnitOfWork;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using Docker.Manager.Model.Base;
using Docker.Manager.Model.Dto;
using Dockify.Model.Entities;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace Docker.Manager.Core.Controllers
{
    [Produces("application/json")]
    [Route("app-template")]
    [EnableCors("teknopalasPolicy")]
    public class ApplicationController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly ILogger<ApplicationController> _logger;
        //     private readonly IDnsService _dnsService;

        private readonly IUnitOfWork _unitOfWork;

        public ApplicationController(
            IConfiguration config,
            ILogger<ApplicationController> logger,
            IUnitOfWork unitOfWork
            //      IDnsService dnsService
            )
        {
            _config = config;
            _logger = logger;
            // _dnsService = dnsService;
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        [Route("home")]
        public IActionResult Get() => Ok(_config.GetSection("app").GetValue<string>("name"));

        [HttpGet]
        [Route("getActive")]
        public Task<IPagedList<DockerAppTemplate>> GetActive()
         => _unitOfWork.GetRepository<DockerAppTemplate>().GetPagedListAsync(
             predicate: t => t.RecordState == RecordState.Active,
             pageIndex: 0,
             pageSize: 1000
             );

        [HttpPost]
        [Route("search-model")]
        public async Task<IPagedList<AppTemplateDto>> SearchWithModel([FromBody] ImageTemplateSearchDto model)
        {
            try
            {
                var result = await _unitOfWork.GetRepository<DockerAppTemplate>().GetPagedListAsync(
                     x => new AppTemplateDto
                     {
                         Id = x.Id,
                         TemplateTitle = x.TemplateTitle,
                         AutoUpdate = x.AutoUpdate,
                         Binds = x.Binds,
                         Description = x.Description,
                         Env = x.Env,
                         Cmd = x.Cmd,
                         EntryPoint = x.EntryPoint,
                         LogoURL = x.LogoURL,
                         Platform = x.Platform,
                         Ports = x.Ports,
                         PublishAllPorts = x.PublishAllPorts,
                         AlwaysPullImage = x.AlwaysPullImage,
                         IsProtected = x.IsProtected,                         
                         StartContainer = x.StartContainer,
                         CreatedOn = x.CreatedOn
                     },
                     predicate: t => (t.RecordState == RecordState.Active &&
                                     (model.TemplateTitle == null || t.TemplateTitle.Contains(model.TemplateTitle)) &&
                                     (model.Description == null || t.Description.Contains(model.Description))
                                    )

                     , pageIndex: model.PageIndex, pageSize: model.PageSize

                     );

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error : {ex.Message}");
                return null;
            }
        }

        [HttpGet]
        [Route("getById/{id}")]
        public async Task<DockerAppTemplate> GetById(Guid id)
        {
            var data = await _unitOfWork.GetRepository<DockerAppTemplate>().FindAsync(id);
            return data;
        }

        [HttpPost]
        [Route("post")]
        public async Task<IActionResult> Post([FromBody] DockerAppTemplate value)
        {
            try
            {
                var checkIfExist = await _unitOfWork.GetRepository<DockerAppTemplate>()
                    .GetFirstOrDefaultAsync(predicate: p => p.TemplateTitle.Equals(value.TemplateTitle) && p.RecordState == RecordState.Active);
                if (checkIfExist != null)
                {
                    _logger.LogError($"Error : ${ value.TemplateTitle} already exists!");
                    return BadRequest(new { id = string.Empty, Success = false, MessageCode = 0, Message = $"Title : {value.TemplateTitle} already exists!" });
                }

                var repo = _unitOfWork.GetRepository<DockerAppTemplate>();
                repo.Insert(value);

                var success = await _unitOfWork.SaveChangesAsync(ensureAutoHistory: true) > 0;

                return Ok(new { id = value.Id, Success = success, MessageCode = 0, Message = string.Empty });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Post Error : {ex.Message}");
                return BadRequest(new { id = value.Id, Success = false, MessageCode = 0, Message = ex.Message });
            }
        }

        [HttpPut]
        [Route("put/{id}")]
        public async Task<IActionResult> Put([FromBody] DockerAppTemplate value, Guid id)
        {
            try
            {
                var success = false;
                var repo = await _unitOfWork.GetRepository<DockerAppTemplate>().FindAsync(id);
                if (repo is null)
                {
                    _logger.LogError($"Error : Record not found!");

                    return BadRequest(new { id = id, Success = false, MessageCode = 0, Message = "Record not found!" });
                }

                repo.TemplateTitle = value.TemplateTitle;
                repo.AutoUpdate = value.AutoUpdate;
                repo.Binds = value.Binds;
                repo.Description = value.Description;
                repo.Env = value.Env;
                repo.EntryPoint = value.EntryPoint;
                repo.Cmd = value.Cmd;
                repo.LogoURL = value.LogoURL;
                repo.Platform = value.Platform;
                repo.Ports = value.Ports;
                repo.PublishAllPorts = value.PublishAllPorts;
                repo.StartContainer = value.StartContainer;
                repo.IsProtected = value.IsProtected;
                repo.AlwaysPullImage = value.AlwaysPullImage;

                success = await _unitOfWork.SaveChangesAsync() > 0;

                return Ok(new { id = value.Id, Success = success, MessageCode = 0, Message = string.Empty });
            }

            catch (Exception ex)
            {
                _logger.LogError($"Update Error : {ex.Message}");
                return BadRequest(new { id = value.Id, Success = false, MessageCode = 0, Message = ex.Message });
            }
        }

        [HttpPut]
        [Route("delete/{id}")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            try
            {
                var success = false;
                var repo = await _unitOfWork.GetRepository<DockerAppTemplate>().FindAsync(id);
                if (repo is null)
                {
                    _logger.LogError($"Error : Record not found!");
                    return BadRequest(new { id = id, Success = false, MessageCode = 0, Message = "Record not found!" });
                }

                repo.RecordState = RecordState.Deleted;
                success = await _unitOfWork.SaveChangesAsync() > 0;

                return Ok(new { id, Success = success, MessageCode = 0, Message = string.Empty });
            }

            catch (Exception ex)
            {
                _logger.LogError($"Delete Error : {ex.Message}");
                return BadRequest(new { id, Success = false, MessageCode = 0, Message = ex.Message });
            }
        }

    }
}
